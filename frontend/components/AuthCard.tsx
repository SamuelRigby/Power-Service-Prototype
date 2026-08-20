import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import styles from "./AuthCard.module.css";

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className={styles.section}>
        <div className={`container ${styles.wrap}`}>
          <div className={styles.card}>{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}
