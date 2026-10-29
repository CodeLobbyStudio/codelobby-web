/** Explicit navigation animation, including browsers with native smooth scrolling disabled. */
export function scrollToSection(section: HTMLElement, centered: boolean) {
  const start = window.scrollY;
  const rect = section.getBoundingClientRect();
  const padding =
    parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) ||
    0;
  const offset = centered ? (window.innerHeight - rect.height) / 2 : padding;
  const limit = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight,
  );
  const target = Math.min(limit, Math.max(0, start + rect.top - offset));
  const duration = 500;
  let frame = 0;
  let started: number | undefined;

  function cancel() {
    window.cancelAnimationFrame(frame);
    window.removeEventListener('wheel', cancel);
    window.removeEventListener('touchstart', cancel);
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', cancel);
  }
  function onKey(event: KeyboardEvent) {
    if (
      [
        'ArrowUp',
        'ArrowDown',
        'PageUp',
        'PageDown',
        'Home',
        'End',
        ' ',
        'Tab',
        'Escape',
      ].includes(event.key)
    )
      cancel();
  }
  function step(timestamp: number) {
    started ??= timestamp;
    const progress = Math.min(1, (timestamp - started) / duration);
    const eased =
      progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
    window.scrollTo({
      top: start + (target - start) * eased,
      behavior: 'instant',
    });
    if (progress < 1) frame = window.requestAnimationFrame(step);
    else cancel();
  }

  window.addEventListener('wheel', cancel, { passive: true });
  window.addEventListener('touchstart', cancel, { passive: true });
  window.addEventListener('keydown', onKey);
  window.addEventListener('resize', cancel);
  frame = window.requestAnimationFrame(step);
  return cancel;
}
