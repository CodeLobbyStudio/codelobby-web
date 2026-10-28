import type { ReactNode } from 'react';

export function Alert({
  title,
  children,
  variant = 'info',
  announce = false,
}: {
  title: string;
  children?: ReactNode;
  variant?: 'info' | 'error';
  announce?: boolean;
}) {
  return (
    <div
      className={`alert alert--${variant}`}
      role={announce ? (variant === 'error' ? 'alert' : 'status') : undefined}
    >
      <span className="alert-mark" aria-hidden="true">
        {variant === 'error' ? '!' : 'i'}
      </span>
      <div>
        <p className="alert-title">{title}</p>
        {children && <div className="alert-content">{children}</div>}
      </div>
    </div>
  );
}
