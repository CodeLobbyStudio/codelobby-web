import { afterEach, describe, expect, it, vi } from 'vitest';
import { scrollToSection } from '../src/app/scrollToSection';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function prepare() {
  let nextFrame: FrameRequestCallback = () => {};
  const raf = vi
    .spyOn(window, 'requestAnimationFrame')
    .mockImplementation((callback) => {
      nextFrame = callback;
      return 1;
    });
  const cancelFrame = vi.spyOn(window, 'cancelAnimationFrame');
  const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(
    3000,
  );
  const section = document.createElement('section');
  vi.spyOn(section, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(0, 1000, 300, 200),
  );
  return {
    section,
    raf,
    cancelFrame,
    scroll,
    advance: (time: number) => nextFrame(time),
  };
}

describe('section scroll animation', () => {
  it('passes through intermediate positions and centers the target despite reduced motion', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const { section, scroll, advance } = prepare();
    const target = 1000 - (window.innerHeight - 200) / 2;
    scrollToSection(section, true);
    advance(0);
    expect(scroll).toHaveBeenLastCalledWith({ top: 0, behavior: 'instant' });
    advance(250);
    expect(scroll).toHaveBeenLastCalledWith({
      top: target / 2,
      behavior: 'instant',
    });
    advance(500);
    expect(scroll).toHaveBeenLastCalledWith({
      top: target,
      behavior: 'instant',
    });
  });

  it('cancels animation when the user scrolls manually', () => {
    const { section, raf, cancelFrame, advance } = prepare();
    scrollToSection(section, false);
    advance(0);
    expect(raf).toHaveBeenCalledTimes(2);
    window.dispatchEvent(new WheelEvent('wheel'));
    expect(cancelFrame).toHaveBeenCalledWith(1);
  });

  it('keeps the beginning visible when the centered section is taller than the viewport', () => {
    const { section, scroll, advance } = prepare();
    vi.mocked(section.getBoundingClientRect).mockReturnValue(
      new DOMRect(0, 1000, 300, window.innerHeight + 400),
    );
    scrollToSection(section, true);
    advance(0);
    advance(500);
    expect(scroll).toHaveBeenLastCalledWith({ top: 1000, behavior: 'instant' });
  });
});
