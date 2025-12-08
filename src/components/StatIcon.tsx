import React from 'react'

type IconProps = { className?: string }

const cx = (base: string, extra?: string) => (extra ? `${base} ${extra}` : base)

export function HeartIcon({ className }: IconProps) {
  return (
    <svg
      className={cx('statIcon', className)}
      viewBox="0 0 24 24"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#ef4444"
        d="M12 21s-7-4.35-10-9C-0.47 8.24 1.52 3.5 5.8 3.5c2.04 0 3.62 1 4.2 2.12C10.98 4.5 12.7 3.5 14.7 3.5 19 3.5 21 8.24 19 12c-3 4.65-10 9-10 9Z"
      />
    </svg>
  )
}

export function TrophyIcon({ className }: IconProps) {
  return (
    <svg
      className={cx('statIcon', className)}
      viewBox="0 0 24 24"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#f59e0b"
        d="M18 4V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v1H3v3a4 4 0 0 0 4 4h.27A5 5 0 0 0 11 13.9V17H8a1 1 0 0 0-1 1v1h10v-1a1 1 0 0 0-1-1h-3v-3.1A5 5 0 0 0 16.73 11H17a4 4 0 0 0 4-4V4Zm-2 3a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3V5h8Z"
      />
    </svg>
  )
}
