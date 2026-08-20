"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import styles from "./AuthForm.module.css";

interface TokenResponse {
  access_token: string;
  token_type: string;
}

export function SignupForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) {
      setError("Enter a username and password.");
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch("/api/v1/auth/signup", {
        method: "POST",
        body: { username: trimmedUsername, password },
      });

      // Signup doesn't return a token - log straight in with the same
      // credentials so creating an account goes straight into the app.
      try {
        const result = await apiFetch<TokenResponse>("/api/v1/auth/login", {
          method: "POST",
          body: { username: trimmedUsername, password },
        });
        login(result.access_token);
        router.push("/dashboard");
      } catch {
        router.push("/login");
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("That username is already taken.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <p className={styles.eyebrow}>Create Account</p>
      <h1 className={styles.heading}>Sign Up</h1>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <div className={styles.field}>
        <label htmlFor="signup-username">Username</label>
        <input
          id="signup-username"
          name="username"
          type="text"
          autoComplete="username"
          required
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="signup-password">Password</label>
        <input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      <button type="submit" className={styles.submit} disabled={submitting}>
        {submitting ? "Creating account…" : "Sign Up"}
      </button>

      <p className={styles.switch}>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </form>
  );
}
