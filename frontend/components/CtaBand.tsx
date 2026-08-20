"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import styles from "./CtaBand.module.css";

export function CtaBand() {
  const { token, isHydrated } = useAuth();
  const signedIn = isHydrated && token !== null;

  return (
    <section className={styles.band}>
      <div className={`container ${styles.inner}`}>
        <div>
          <h2 className={styles.heading}>
            {signedIn ? "Welcome back" : "Try the prototype"}
          </h2>
          <p className={styles.body}>
            {signedIn
              ? "Pick up where you left off - customer records, power sources, and the weekly scheduling grid."
              : "Sign in, or create an account, to try customer records, power sources, and the weekly scheduling grid firsthand."}
          </p>
        </div>
        {signedIn ? (
          <Link href="/dashboard" className={styles.cta}>
            Go to Dashboard
          </Link>
        ) : (
          <Link href="/login" className={styles.cta}>
            Client Login
          </Link>
        )}
      </div>
    </section>
  );
}
