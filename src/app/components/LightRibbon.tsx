import { useId } from 'react';

/** Decorative light along the space between sections, never over the content. */
export function LightRibbon({
  variant = 'hero',
}: {
  variant?: 'hero' | 'steps' | 'teacher';
}) {
  const id = useId();
  const curve = {
    hero: 'M-80 38C260 190 930 235 1520 42',
    steps: 'M-80 92C420 218 1120 178 1520 14',
    teacher: 'M-80 32C280 12 840 246 1520 102',
  }[variant];
  return (
    <svg
      className="light-ribbon"
      viewBox="0 0 1440 220"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-light`}>
          <stop stopColor="#ff871c" stopOpacity="0" />
          <stop offset=".15" stopColor="#ff871c" stopOpacity=".3" />
          <stop offset=".48" stopColor="#ffad48" stopOpacity=".8" />
          <stop offset=".85" stopColor="#ff6b20" stopOpacity=".4" />
          <stop offset="1" stopColor="#ff871c" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-10%" y="-80%" width="120%" height="260%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <path
        d={curve}
        fill="none"
        stroke={`url(#${id}-light)`}
        strokeWidth="10"
        opacity=".35"
        filter={`url(#${id}-glow)`}
      />
      <path
        d={curve}
        fill="none"
        stroke={`url(#${id}-light)`}
        strokeWidth=".8"
      />
      <path
        className="ribbon-current"
        d={curve}
        pathLength="100"
        fill="none"
        stroke={`url(#${id}-light)`}
        strokeWidth="2"
      />
    </svg>
  );
}
