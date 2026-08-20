"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { ServiceNav } from "./ServiceNav";
import styles from "./ServiceShell.module.css";

export function ServiceShell({ children }: { children: ReactNode }) {
  const { token, isHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && token === null) {
      router.replace("/login");
    }
  }, [isHydrated, token, router]);

  if (!isHydrated || token === null) {
    return (
      <div className={styles.checking}>
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <>
      <ServiceNav />
      <main className={styles.main}>{children}</main>
    </>
  );
}
