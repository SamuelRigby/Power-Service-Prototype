import styles from "./LoadCurveDivider.module.css";

/**
 * Decorative silhouette shaped like a real grid-operations reference: the
 * "duck curve" utilities watch for - demand dips at midday as solar output
 * rises, then ramps sharply into the evening peak. Illustrative only, not
 * plotted data, so it's labeled as such rather than implying live figures.
 */
export function LoadCurveDivider() {
  return (
    <div className={styles.wrapper} role="presentation">
      <svg
        className={styles.svg}
        viewBox="0 0 1200 220"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          className={styles.fill}
          d="M0,150 C60,130 120,105 150,98 C220,82 260,75 300,78 C360,84 400,122 450,162 C520,182 560,182 600,178 C660,162 700,150 750,138 C800,105 850,62 900,42 C950,36 1000,34 1050,36 C1100,46 1150,74 1200,108 L1200,220 L0,220 Z"
        />
        <path
          className={styles.line}
          d="M0,150 C60,130 120,105 150,98 C220,82 260,75 300,78 C360,84 400,122 450,162 C520,182 560,182 600,178 C660,162 700,150 750,138 C800,105 850,62 900,42 C950,36 1000,34 1050,36 C1100,46 1150,74 1200,108"
          fill="none"
        />
      </svg>
      <p className={styles.caption}>SYSTEM LOAD, ILLUSTRATIVE — WEEKDAY PROFILE</p>
    </div>
  );
}
