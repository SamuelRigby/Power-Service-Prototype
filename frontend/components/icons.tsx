type IconProps = {
  className?: string;
};

/** Small node mark used as the wordmark glyph - a circuit node, not a generic logo shape. */
export function NodeMark({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="4.5" fill="currentColor" />
      <path
        d="M16 2 V9.5 M16 22.5 V30 M2 16 H9.5 M22.5 16 H30 M6.5 6.5 L11 11 M21 21 L25.5 25.5 M25.5 6.5 L21 11 M11 21 L6.5 25.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Utility meter dial - stands in for the customer/account capability. */
export function MeterIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="15" stroke="currentColor" strokeWidth="1.6" fill="none" />
      <path
        d="M20 20 L27 13.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="20" cy="20" r="1.8" fill="currentColor" />
      {[...Array(8)].map((_, i) => {
        const angle = (i * Math.PI) / 4 - Math.PI / 2;
        const x1 = 20 + Math.cos(angle) * 12.5;
        const y1 = 20 + Math.sin(angle) * 12.5;
        const x2 = 20 + Math.cos(angle) * 10.5;
        const y2 = 20 + Math.sin(angle) * 10.5;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

/** Bolt-in-cell - stands in for the power source capability. */
export function BoltIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="15" stroke="currentColor" strokeWidth="1.6" fill="none" />
      <path
        d="M21.5 11 L13.5 21.5 H19 L18 29 L27 18 H21 Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/** Slot grid - stands in for the weekly scheduling capability. */
export function ScheduleGridIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="15" stroke="currentColor" strokeWidth="1.6" fill="none" />
      <g stroke="currentColor" strokeWidth="1.4">
        <rect x="12.5" y="12.5" width="15" height="15" fill="none" />
        <line x1="12.5" y1="17.5" x2="27.5" y2="17.5" />
        <line x1="12.5" y1="22.5" x2="27.5" y2="22.5" />
        <line x1="17.5" y1="12.5" x2="17.5" y2="27.5" />
        <line x1="22.5" y1="12.5" x2="22.5" y2="27.5" />
      </g>
      <rect x="17.7" y="17.7" width="4.6" height="4.6" fill="currentColor" />
      <rect x="22.7" y="12.7" width="4.6" height="4.6" fill="currentColor" opacity="0.55" />
    </svg>
  );
}
