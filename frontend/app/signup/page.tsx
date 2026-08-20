import type { Metadata } from "next";
import { AuthCard } from "@/components/AuthCard";
import { SignupForm } from "@/components/SignupForm";

export const metadata: Metadata = {
  title: "Sign Up — Power Service Prototype",
};

export default function SignupPage() {
  return (
    <AuthCard>
      <SignupForm />
    </AuthCard>
  );
}
