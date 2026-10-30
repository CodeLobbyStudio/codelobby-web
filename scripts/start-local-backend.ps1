# Run from PowerShell. Secrets are read from the sibling infra/.env, never printed.
$ErrorActionPreference = 'Stop'
$taskProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$taskInfraRoot = Join-Path $taskProjectRoot 'codelobby-infra'
$taskBackendRoot = Join-Path $taskProjectRoot 'codelobby-backend'
$taskEnvPath = Join-Path $taskInfraRoot '.env'

if (-not (Test-Path -LiteralPath $taskEnvPath)) {
    throw 'Configure codelobby-infra/.env first, including POSTGRES_PASSWORD and JWT_SECRET_BASE64. See README.'
}
$taskValues = @{}
Get-Content -LiteralPath $taskEnvPath | ForEach-Object {
    if ($_ -match '^\s*([A-Z][A-Z0-9_]*)=(.*)$') {
        $taskValue = $Matches[2].Trim()
        if (($taskValue.StartsWith('"') -and $taskValue.EndsWith('"')) -or
            ($taskValue.StartsWith("'") -and $taskValue.EndsWith("'"))) {
            $taskValue = $taskValue.Substring(1, $taskValue.Length - 2)
        }
        $taskValues[$Matches[1]] = $taskValue
    }
}
if (-not $taskValues['POSTGRES_PASSWORD'] -or -not $taskValues['JWT_SECRET_BASE64']) {
    throw 'POSTGRES_PASSWORD and JWT_SECRET_BASE64 are required in the local infra/.env.'
}
if ([Convert]::FromBase64String($taskValues['JWT_SECRET_BASE64']).Length -ne 32) {
    throw 'JWT_SECRET_BASE64 must encode exactly 32 bytes.'
}
$taskJdk = Get-ChildItem -LiteralPath (Join-Path $env:ProgramFiles 'Microsoft') -Directory -Filter 'jdk-21*' -ErrorAction SilentlyContinue |
    Sort-Object Name -Descending | Select-Object -First 1
if ($taskJdk) {
    $env:JAVA_HOME = $taskJdk.FullName
}
if (-not $env:JAVA_HOME -or -not (Test-Path -LiteralPath (Join-Path $env:JAVA_HOME 'bin/javac.exe'))) {
    throw 'Install JDK 21 or set JAVA_HOME to your JDK 21 directory.'
}
$env:PATH = (Join-Path $env:JAVA_HOME 'bin') + ';' + $env:PATH
$env:DB_HOST = '127.0.0.1'
$env:DB_PORT = $taskValues['POSTGRES_PORT']
$env:DB_NAME = $taskValues['POSTGRES_DB']
$env:DB_USER = $taskValues['POSTGRES_USER']
$env:DB_PASSWORD = $taskValues['POSTGRES_PASSWORD']
$env:JWT_SECRET_BASE64 = $taskValues['JWT_SECRET_BASE64']
$env:SERVER_ADDRESS = '127.0.0.1'

Push-Location $taskInfraRoot
try {
    & docker compose --env-file .env -f local/compose.yaml up -d --wait --wait-timeout 90
    if ($LASTEXITCODE -ne 0) { throw 'Local PostgreSQL could not be started. Check Docker Desktop.' }
} finally { Pop-Location }

Push-Location $taskBackendRoot
try {
    & .\mvnw.cmd -B -ntp spring-boot:run
    if ($LASTEXITCODE -ne 0) { throw 'Backend exited with an error. Check the preceding application output.' }
} finally { Pop-Location }
