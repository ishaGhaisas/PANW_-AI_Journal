"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn } = useAuth();
  const router = useRouter();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signIn(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 text-center lg:hidden">
        <h1
          className="font-journal text-4xl font-bold text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-journal)" }}
        >
          BuJo AI
        </h1>
      </div>

      <h2 className="mb-2 text-2xl font-semibold text-[var(--color-text)]">
        Welcome back
      </h2>
      <p className="mb-8 text-[var(--color-muted)]">
        Sign in to continue your journaling journey
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-[var(--color-text)]"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            required
            className="w-full rounded-lg border border-[var(--color-shell)] bg-white px-4 py-3 text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-[var(--color-text)]"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            required
            className="w-full rounded-lg border border-[var(--color-shell)] bg-white px-4 py-3 text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2"
            placeholder="••••••••"
          />
        </div>

        <div>
          <Button type="submit" variant="primary" loading={loading} className="w-full">
            Sign in
          </Button>
          {error && (
            <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-[var(--color-accent)] hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
