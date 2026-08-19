type GridPatternProps = {
  className?: string;
  id: string;
};

/**
 * Tiled single-line-diagram texture - thin transmission lines converging on
 * node points. Decorative only; kept low-contrast so it reads as texture,
 * not content.
 */
export function GridPattern({ className, id }: GridPatternProps) {
  return (
    <svg className={className} aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <pattern id={id} width="96" height="96" patternUnits="userSpaceOnUse">
          <path
            d="M0 48 H96 M48 0 V96 M0 0 L96 96 M96 0 L0 96"
            stroke="currentColor"
            strokeWidth="0.75"
            opacity="0.5"
          />
          <circle cx="48" cy="48" r="3" fill="currentColor" opacity="0.9" />
          <circle cx="0" cy="0" r="2" fill="currentColor" opacity="0.6" />
          <circle cx="96" cy="0" r="2" fill="currentColor" opacity="0.6" />
          <circle cx="0" cy="96" r="2" fill="currentColor" opacity="0.6" />
          <circle cx="96" cy="96" r="2" fill="currentColor" opacity="0.6" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
