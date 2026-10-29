import type { ReactNode } from 'react';

const shapes: Record<string, ReactNode> = {
  arrowLeft: <path d="M19 12H5m6-6-6 6 6 6" />,
  arrowRight: <path d="M5 12h14m-6-6 6 6-6 6" />,
  zoom: (
    <>
      <circle cx="10" cy="10" r="6" />
      <path d="m15 15 6 6M10 7v6M7 10h6" />
    </>
  ),
  play: <path d="m8 4 12 8-12 8z" />,
  send: <path d="m3 3 18 9-18 9 4-9-4-9Zm4 9h14" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  code: (
    <>
      <path d="m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18" />
    </>
  ),
  tasks: (
    <>
      <path d="M3 4h7l2 2 2-2h7v15h-7l-2 2-2-2H3zM12 6v15" />
    </>
  ),
  lobby: (
    <>
      <path d="m8 6-6 6 6 6m8-12 6 6-6 6M14 5l-4 14" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V11h3v9m4 0V6h3v14m4 0V2h3v18" />
    </>
  ),
  teacher: (
    <>
      <path d="M4 12h16l2 9H2zM7 12V8a5 5 0 0 1 10 0v4M9 5h6M8 16h8" />
    </>
  ),
  bell: (
    <>
      <path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5zM10 21h4M12 2v2" />
    </>
  ),
  pin: (
    <>
      <path d="M17 9c0 4-5 8-5 8s-5-4-5-8a5 5 0 0 1 10 0Z" />
      <circle cx="12" cy="9" r="1.5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="7" r="3" />
      <path d="M2 21v-3a7 7 0 0 1 14 0v3zM16 3a3 3 0 0 1 0 6m2 4a5 5 0 0 1 4 5v3h-3" />
    </>
  ),
  file: (
    <>
      <path d="M5 2h9l5 5v15H5zM14 2v6h5m-11 7 3 3 5-6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M10 2h4M12 2v3m0 3v5l3 2" />
    </>
  ),
  github: (
    <>
      <path d="M9 20c-5 1-5-2-7-2m14 4v-4c0-1-.3-2-1-2 4-.5 6-2 6-6 0-2-.5-3-2-4 .2-1 0-3 0-3s-2-.2-4 1a14 14 0 0 0-6 0C7 3 5 3 5 3s-.2 2 0 3C3.5 7 3 8 3 10c0 4 2 5.5 6 6-.7.5-1 1-1 2v4" />
    </>
  ),
  discord: (
    <>
      <path d="M7 5 4 6 1 18l6 3 1-3h8l1 3 6-3-3-12-3-1-1 2H8z" />
      <circle cx="8" cy="13" r="1" />
      <circle cx="16" cy="13" r="1" />
    </>
  ),
  youtube: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="4" />
      <path d="m10 9 6 3-6 3z" />
    </>
  ),
  x: (
    <>
      <path d="m3 3 18 18h-5L3 3h5l13 18M21 3 3 21" />
    </>
  ),
};

export function Icon({
  name,
  className = '',
}: {
  name: string;
  className?: string;
}) {
  return (
    <svg
      className={`icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {shapes[name] ?? shapes.code}
    </svg>
  );
}
