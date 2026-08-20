"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { NodeMark } from "./icons";
import styles from "./Header.module.css";

export function Header() {
  const { token, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/");
  }

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
          <Link href="/#capabilities" className={styles.platformLink}>
            What it does
          </Link>
          {token ? (
            <>
              <button type="button" onClick={handleLogout} className={styles.logoutLink}>
                Logout
              </button>
              <Link href="/dashboard" className={styles.navCta}>
                Go to Dashboard
              </Link>
            </>
          ) : (
            <Link href="/login" className={styles.navCta}>
              Client Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
