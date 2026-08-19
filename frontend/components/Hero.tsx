import Link from "next/link";
import { GridPattern } from "./GridPattern";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero}>
      <GridPattern id="hero-grid" className={styles.pattern} />
      <div className={styles.scrim} aria-hidden="true" />
      <div className={`container ${styles.inner}`}>
        <p className={styles.eyebrow}>Full-Stack Portfolio Project</p>
        <h1 className={styles.headline}>
          Power Service
          <br />
          Prototype.
        </h1>
        <p className={styles.subhead}>
          A demo application for a fictional power utility — not a real
          service. It models managing customer accounts, power sources, and a
          weekly power-scheduling grid.
        </p>
        <div className={styles.actions}>
          <Link href="/login" className={styles.primaryCta}>
            Client Login
          </Link>
          <a href="#capabilities" className={styles.secondaryCta}>
            See what it does ↓
          </a>
        </div>
      </div>
    </section>
  );
}
