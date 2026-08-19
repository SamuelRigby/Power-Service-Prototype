import Link from "next/link";
import styles from "./CtaBand.module.css";

export function CtaBand() {
  return (
    <section className={styles.band}>
      <div className={`container ${styles.inner}`}>
        <div>
          <h2 className={styles.heading}>Try the prototype</h2>
          <p className={styles.body}>
            Sign in, or create an account, to try customer records, power sources, and
            the weekly scheduling grid firsthand.
          </p>
        </div>
        <Link href="/login" className={styles.cta}>
          Client Login
        </Link>
      </div>
    </section>
  );
}
