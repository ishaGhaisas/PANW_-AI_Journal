"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getUserFriendlyError } from "@/lib/utils/errorHandler";
import "./LoginForm.css";

/**
 * Login form component for user authentication
 */
export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn } = useAuth();
  const router = useRouter();

  /**
   * Handles email input changes
   */
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  /**
   * Handles password input changes
   */
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError("");
  };

  /**
   * Handles form submission and user login
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signIn(email, password);
      router.push("/");
    } catch (err: unknown) {
      setError(getUserFriendlyError(err, "Failed to sign in"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form">
      <div className="login-form__mobile-title">
        <h1 className="login-form__title">BuJo AI</h1>
      </div>

      <h2 className="login-form__heading">Welcome back</h2>
      <p className="login-form__subheading">Sign in to continue your journaling journey</p>

      <form onSubmit={handleSubmit} className="login-form__form">
        <div className="login-form__field">
          <label htmlFor="email" className="login-form__label">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            required
            className="login-form__input"
            placeholder="you@example.com"
          />
        </div>

        <div className="login-form__field">
          <label htmlFor="password" className="login-form__label">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            required
            className="login-form__input"
            placeholder="••••••••"
          />
        </div>

        <div className="login-form__field">
          <Button type="submit" variant="primary" loading={loading} className="w-full">
            Sign in
          </Button>
          {error && <div className="login-form__error">{error}</div>}
        </div>
      </form>

      <p className="login-form__footer">
        Don't have an account?{" "}
        <Link href="/register" className="login-form__link">
          Sign up
        </Link>
      </p>
    </div>
  );
}
