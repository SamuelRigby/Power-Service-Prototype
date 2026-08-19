import { NodeMark } from "./icons";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <NodeMark className={styles.mark} />
          <span>Power Service Prototype</span>
        </div>
        <p className={styles.tagline}>A portfolio project — not a real utility or service.</p>
      </div>
    </footer>
  );
}
