import { useId } from 'react';

export function NeonCode() {
  const id = useId();
  const path =
    'M140 76 67 141Q60 148 68 155L140 220M250 48 192 253M297 76 370 141Q377 148 369 155L297 220';
  return (
    <div className="neon-art" aria-hidden="true">
      <svg viewBox="0 0 440 310">
        <defs>
          <linearGradient id={`${id}-color`} x1="0" y1="0" x2="1" y2="0.5">
            <stop stopColor="#ffe184" />
            <stop offset=".35" stopColor="#ff8a22" />
            <stop offset=".62" stopColor="#ff3236" />
            <stop offset="1" stopColor="#ff26ad" />
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
          d={path}
          fill="none"
          stroke="#ff410b"
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
      <div className="neon-reflection" />
    </div>
  );
}
