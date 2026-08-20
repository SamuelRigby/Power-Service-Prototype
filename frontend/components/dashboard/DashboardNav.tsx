"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { NodeMark } from "../icons";
import styles from "./DashboardNav.module.css";

const links = [
  { href: "/dashboard/customers", label: "Customers" },
  { href: "/dashboard/power-sources", label: "Power Sources" },
  { href: "/dashboard/schedule", label: "Schedule" },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { logout } = useAuth();

  // No explicit navigation here - clearing the token is enough. DashboardShell's
  // own guard reacts to the token going null and redirects to /login, since
  // it can't render its children without one anyway; a second redirect here
  // would just race it.
  function handleLogout() {
    logout();
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
        <nav className={styles.nav} aria-label="Dashboard">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? styles.navLinkActive : styles.navLink}
            >
              {link.label}
            </Link>
          ))}
          <button type="button" onClick={handleLogout} className={styles.logoutLink}>
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
