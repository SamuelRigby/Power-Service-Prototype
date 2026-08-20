import type { ReactNode } from "react";
import { ServiceShell } from "@/components/service/ServiceShell";

export default function ServiceLayout({ children }: { children: ReactNode }) {
  return <ServiceShell>{children}</ServiceShell>;
}
