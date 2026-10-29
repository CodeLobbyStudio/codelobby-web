import { useEffect, useId, useRef } from 'react';

export function NeonCode() {
  const id = useId();
  const artRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const art = artRef.current;
    if (!art || !window.matchMedia) return;
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let frame = 0;
    let x = 0;
    let y = 0;
    let targetX = 0;
    let targetY = 0;
    function animate() {
      x += (targetX - x) * 0.12;
      y += (targetY - y) * 0.12;
      art!.style.setProperty('--pointer-x', x.toFixed(4));
      art!.style.setProperty('--pointer-y', y.toFixed(4));
      frame =
        Math.abs(targetX - x) + Math.abs(targetY - y) > 0.002
          ? window.requestAnimationFrame(animate)
          : 0;
    }
    function update(event: PointerEvent) {
      if (!pointer.matches || event.pointerType === 'touch') return;
      const rect = art!.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      targetX = (event.clientX / window.innerWidth) * 2 - 1;
      targetY = (event.clientY / window.innerHeight) * 2 - 1;
      if (!frame) frame = window.requestAnimationFrame(animate);
    }
    function reset() {
      targetX = 0;
      targetY = 0;
      if (!frame) frame = window.requestAnimationFrame(animate);
    }
    window.addEventListener('pointermove', update, { passive: true });
    window.addEventListener('blur', reset);
    document.documentElement.addEventListener('pointerleave', reset);
    pointer.addEventListener('change', reset);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', update);
      window.removeEventListener('blur', reset);
      document.documentElement.removeEventListener('pointerleave', reset);
      pointer.removeEventListener('change', reset);
    };
  }, []);
  const path =
    'M140 76 67 141Q60 148 68 155L140 220M250 48 192 253M297 76 370 141Q377 148 369 155L297 220';
  return (
    <div className="neon-art" ref={artRef} aria-hidden="true">
      <svg className="neon-symbol" viewBox="0 0 440 310">
        <defs>
          <linearGradient id={`${id}-color`} x1="0" y1="0" x2="1" y2="0.5">
            <stop className="neon-color neon-color--one" stopColor="#ffb145" />
            <stop
              className="neon-color neon-color--two"
              offset=".5"
              stopColor="#ff4938"
            />
            <stop
              className="neon-color neon-color--three"
              offset="1"
              stopColor="#ff3298"
            />
          </linearGradient>
          <filter
            id={`${id}-blur`}
            x="-60%"
            y="-80%"
            width="220%"
            height="260%"
          >
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>
        <path
          className="neon-bloom"
          d={path}
          fill="none"
          stroke={`url(#${id}-color)`}
          strokeWidth="46"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${id}-blur)`}
          opacity=".9"
        />
        <path
          d={path}
          transform="translate(5 9)"
          fill="none"
          stroke="#a42121"
          strokeWidth="40"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={path}
          fill="none"
          stroke={`url(#${id}-color)`}
          strokeWidth="36"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="neon-energy"
          d={path}
          fill="none"
          stroke={`url(#${id}-color)`}
          strokeWidth="37"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={path}
          transform="translate(-4 -5)"
          fill="none"
          stroke="#ffe9a0"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".9"
        />
      </svg>
      <svg
        className="neon-reflection"
        viewBox="0 0 440 80"
        preserveAspectRatio="none"
      >
        <ellipse cx="220" cy="40" rx="195" ry="20" fill={`url(#${id}-color)`} />
      </svg>
    </div>
  );
}
