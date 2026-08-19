import Link from "next/link";
import { NodeMark } from "./icons";
import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand}>
          <NodeMark className={styles.mark} />
          <span>
            Power Service<span className={styles.brandLight}> Prototype</span>
          </span>
        </Link>
        <nav className={styles.nav} aria-label="Primary">
          <a href="#capabilities" className={styles.platformLink}>
            What it does
          </a>
          <Link href="/login" className={styles.navCta}>
            Client Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
