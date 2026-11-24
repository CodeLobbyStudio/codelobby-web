import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Plugin } from 'vite';
import { StreamMessageReader, StreamMessageWriter } from 'vscode-jsonrpc/node';
import { WebSocketServer, type WebSocket } from 'ws';
import { isJavaSourcePath } from '../src/features/workspace/javaSourcePath.ts';

const endpoint = '/dev/java-lsp';
const maxFileSize = 128 * 1024;
const maxProjectSize = 1024 * 1024;

function parseWorkspace(raw: string) {
  const { files } = JSON.parse(raw);
  if (!Array.isArray(files) || files.length === 0 || files.length > 50) {
    throw new Error('Invalid Java workspace');
  }
  const paths = new Set<string>();
  let size = 0;
  return files.map(({ path, text }: { path?: unknown; text?: unknown }) => {
    if (
      typeof path !== 'string' ||
      !isJavaSourcePath(path) ||
      typeof text !== 'string'
    ) {
      throw new Error('Invalid Java source file');
    }
    const sourcePath = path.replace(/^src\//, '');
    const normalized = sourcePath.toLowerCase();
    const fileSize = Buffer.byteLength(text);
    size += fileSize;
    if (
      paths.has(normalized) ||
      fileSize > maxFileSize ||
      size > maxProjectSize
    ) {
      throw new Error('Invalid Java source project');
    }
    paths.add(normalized);
    return { path, sourcePath, text };
  });
}

export function javaLanguageServer(
  jdtlsHome?: string,
  javaHome?: string,
): Plugin {
  return {
    name: 'codelobby-java-lsp',
    apply: 'serve',
    configureServer({ httpServer }) {
      if (!httpServer || !jdtlsHome) return;

      const home = resolve(jdtlsHome);
      const launcher = readdirSync(join(home, 'plugins')).find((name) =>
        /^org\.eclipse\.equinox\.launcher_.*\.jar$/.test(name),
      );
      if (!launcher)
        throw new Error(
          'JDTLS_HOME must point to an extracted Eclipse JDT LS distribution.',
        );

      const sockets = new WebSocketServer({
        noServer: true,
        // Source size is measured on decoded UTF-8. JSON escapes can expand it.
        maxPayload: 7 * maxProjectSize,
      });
      httpServer.on('upgrade', (request, socket, head) => {
        if (request.url !== endpoint) return;
        const host = request.headers.host ?? '';
        const origin = request.headers.origin;
        const localPeer = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(
          socket.remoteAddress ?? '',
        );
        const loopbackHost = /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(
          host,
        );
        if (!localPeer || !loopbackHost || origin !== `http://${host}`) {
          socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');
          return;
        }
        if (sockets.clients.size >= 4) {
          socket.end(
            'HTTP/1.1 503 Service Unavailable\r\nConnection: close\r\n\r\n',
          );
          return;
        }
        sockets.handleUpgrade(request, socket, head, (ws) => {
          ws.on('error', () => ws.close());
          const timeout = setTimeout(() => ws.close(1008), 5_000);
          ws.once('close', () => clearTimeout(timeout));
          ws.once('message', (raw, binary) => {
            clearTimeout(timeout);
            let files: ReturnType<typeof parseWorkspace>;
            try {
              if (binary) throw new Error('Expected a Java workspace');
              files = parseWorkspace(raw.toString());
            } catch {
              ws.close(1008);
              return;
            }
            void startJavaSession(ws, files, home, launcher, javaHome).catch(
              (error: unknown) => {
                console.error('Could not start Eclipse JDT LS:', error);
                ws.close(1011);
              },
            );
          });
        });
      });
      httpServer.on('close', () => sockets.close());
    },
  };
}

async function startJavaSession(
  socket: WebSocket,
  files: ReturnType<typeof parseWorkspace>,
  home: string,
  launcher: string,
  javaHome?: string,
) {
  const directory = await mkdtemp(join(tmpdir(), 'codelobby-java-'));
  const project = join(directory, 'exercise');
  const config = join(directory, 'config');
  const platformConfig =
    process.platform === 'win32'
      ? 'config_win'
      : process.platform === 'darwin'
        ? process.arch === 'arm64'
          ? 'config_mac_arm'
          : 'config_mac'
        : process.arch === 'arm64'
          ? 'config_linux_arm'
          : 'config_linux';
  const cleanUp = () =>
    rm(directory, {
      recursive: true,
      force: true,
      maxRetries: 4,
      retryDelay: 200,
    });

  const documents = files.map(({ path, sourcePath, text }) => ({
    path,
    file: join(project, 'src', sourcePath),
    text,
  }));
  try {
    await mkdir(join(project, 'src'), { recursive: true });
    await mkdir(join(project, '.settings'));
    await Promise.all([
      writeFile(
        join(project, '.project'),
        '<?xml version="1.0"?><projectDescription><name>exercise</name><buildSpec><buildCommand><name>org.eclipse.jdt.core.javabuilder</name></buildCommand></buildSpec><natures><nature>org.eclipse.jdt.core.javanature</nature></natures></projectDescription>',
      ),
      writeFile(
        join(project, '.classpath'),
        '<?xml version="1.0"?><classpath><classpathentry kind="src" path="src"/><classpathentry kind="con" path="org.eclipse.jdt.launching.JRE_CONTAINER/org.eclipse.jdt.internal.debug.ui.launcher.StandardVMType/JavaSE-21"/><classpathentry kind="output" path="bin"/></classpath>',
      ),
      writeFile(
        join(project, '.settings', 'org.eclipse.jdt.core.prefs'),
        'eclipse.preferences.version=1\norg.eclipse.jdt.core.compiler.source=21\norg.eclipse.jdt.core.compiler.compliance=21\norg.eclipse.jdt.core.compiler.codegen.targetPlatform=21\n',
      ),
      ...documents.map(async ({ file, text }) => {
        await mkdir(dirname(file), { recursive: true });
        await writeFile(file, text);
      }),
    ]);
  } catch (error) {
    await cleanUp();
    throw error;
  }

  if (socket.readyState !== socket.OPEN) {
    await cleanUp();
    return;
  }

  const java = javaHome ? join(javaHome, 'bin', 'java') : 'java';
  const child = spawn(
    java,
    [
      '-Declipse.application=org.eclipse.jdt.ls.core.id1',
      '-Dosgi.bundles.defaultStartLevel=4',
      '-Declipse.product=org.eclipse.jdt.ls.core.product',
      `-Dosgi.install.area=${pathToFileURL(home).href}`,
      `-Dosgi.sharedConfiguration.area=${join(home, platformConfig)}`,
      '-Dosgi.sharedConfiguration.area.readOnly=true',
      '-Dosgi.configuration.cascaded=true',
      '-Xms64m',
      '-Xmx512m',
      '--add-modules=ALL-SYSTEM',
      '--add-opens',
      'java.base/java.util=ALL-UNNAMED',
      '--add-opens',
      'java.base/java.lang=ALL-UNNAMED',
      '-jar',
      join(home, 'plugins', launcher),
      '-configuration',
      config,
      '-data',
      join(directory, 'workspace'),
    ],
    { cwd: home, stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true },
  );
  child.stderr.on('data', (chunk) => process.stderr.write(chunk));
  const reader = new StreamMessageReader(child.stdout);
  const writer = new StreamMessageWriter(child.stdin);
  const rootUri = pathToFileURL(project).href;
  const entries = documents.map(({ path, file }) => [
    path,
    pathToFileURL(file).href,
  ]);
  const documentUris = new Set(entries.map(([, uri]) => uri));
  socket.on('close', () => child.kill());
  child.on('error', () => socket.close(1011));
  child.on('close', (code) => {
    if (code) console.warn(`Eclipse JDT LS exited with code ${code}.`);
    reader.dispose();
    writer.dispose();
    socket.close();
    void cleanUp().catch(() =>
      console.warn('Could not remove the temporary Java workspace.'),
    );
  });
  reader.onError(() => socket.close(1011));
  reader.listen((message) => {
    if (socket.readyState === socket.OPEN) socket.send(JSON.stringify(message));
  });
  socket.on('message', (data, binary) => {
    if (binary) {
      socket.close(1003);
      return;
    }
    try {
      const message = JSON.parse(data.toString());
      const { method, params } = message;
      if (method === 'initialize') {
        message.params = {
          processId: null,
          rootUri,
          workspaceFolders: [{ uri: rootUri, name: 'CodeLobby' }],
          capabilities: params?.capabilities,
          initializationOptions: {
            settings: {
              java: {
                signatureHelp: { enabled: true },
                import: {
                  maven: { enabled: false },
                  gradle: { enabled: false },
                },
              },
            },
          },
        };
      } else if (
        method === 'textDocument/didOpen' ||
        method === 'textDocument/didChange' ||
        method === 'textDocument/completion' ||
        method === 'textDocument/signatureHelp' ||
        method === 'textDocument/hover' ||
        method === 'textDocument/formatting'
      ) {
        if (!documentUris.has(params?.textDocument?.uri)) {
          socket.close(1008);
          return;
        }
      } else if (
        method !== undefined &&
        method !== 'initialized' &&
        method !== '$/cancelRequest'
      ) {
        socket.close(1008);
        return;
      }
      void writer.write(message).catch(() => socket.close(1011));
    } catch {
      socket.close(1007);
    }
  });
  socket.send(JSON.stringify({ rootUri, documents: entries }));
}
