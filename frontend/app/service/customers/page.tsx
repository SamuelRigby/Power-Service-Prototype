import type { Metadata } from "next";
import { CustomersView } from "@/components/service/CustomersView";

export const metadata: Metadata = {
  title: "Customers — Power Service Prototype",
};

export default function CustomersPage() {
  return <CustomersView />;
}
