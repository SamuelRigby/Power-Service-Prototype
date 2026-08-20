import type { Metadata } from "next";
import { PowerSourcesView } from "@/components/dashboard/PowerSourcesView";

export const metadata: Metadata = {
  title: "Power Sources — Power Service Prototype",
};

export default function PowerSourcesPage() {
  return <PowerSourcesView />;
}
