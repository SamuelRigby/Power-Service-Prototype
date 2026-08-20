import { POWER_TYPES, POWER_TYPE_COLORS } from "@/lib/powerTypes";
import styles from "./ScheduleLegend.module.css";

export function ScheduleLegend() {
  return (
    <div className={styles.legend}>
      <p className={styles.legendLabel}>Legend</p>
      <ul className={styles.legendList}>
        {POWER_TYPES.map((type) => (
          <li key={type} className={styles.legendItem}>
            <span
              className={styles.dot}
              style={{ backgroundColor: POWER_TYPE_COLORS[type] }}
              aria-hidden="true"
            />
            {type}
          </li>
        ))}
      </ul>
    </div>
  );
}
