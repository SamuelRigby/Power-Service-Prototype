import type { Metadata } from "next";
import { ScheduleView } from "@/components/dashboard/ScheduleView";

export const metadata: Metadata = {
  title: "Schedule — Power Service Prototype",
};

export default function SchedulePage() {
  return <ScheduleView />;
}
