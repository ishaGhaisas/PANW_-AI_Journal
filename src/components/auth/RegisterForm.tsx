"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getUserFriendlyError } from "@/lib/utils/errorHandler";
import { isNonEmptyString } from "@/lib/utils/validation";
import "./RegisterForm.css";

const MIN_PASSWORD_LENGTH = 6;

/**
 * Registration form component for creating new user accounts
 */
export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signUp } = useAuth();
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
   * Handles confirm password input changes
   */
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (error) setError("");
  };

  /**
   * Validates form and handles user registration
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!isNonEmptyString(password) || password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      setLoading(false);
      return;
    }

    try {
      await signUp(email, password);
      router.push("/");
    } catch (err: unknown) {
      setError(getUserFriendlyError(err, "Failed to create account"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-form">
      <div className="register-form__mobile-title">
        <h1 className="register-form__title">BuJo AI</h1>
      </div>

      <h2 className="register-form__heading">Create your account</h2>
      <p className="register-form__subheading">Start your journaling journey today</p>

      <form onSubmit={handleSubmit} className="register-form__form">
        <div className="register-form__field">
          <label htmlFor="email" className="register-form__label">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            required
            className="register-form__input"
            placeholder="you@example.com"
          />
        </div>

        <div className="register-form__field">
          <label htmlFor="password" className="register-form__label">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            required
            minLength={MIN_PASSWORD_LENGTH}
            className="register-form__input"
            placeholder="••••••••"
          />
          <p className="register-form__hint">At least {MIN_PASSWORD_LENGTH} characters</p>
        </div>

        <div className="register-form__field">
          <label htmlFor="confirmPassword" className="register-form__label">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            required
            className="register-form__input"
            placeholder="••••••••"
          />
        </div>

        <div className="register-form__field">
          <Button type="submit" variant="primary" loading={loading} className="w-full">
            Create account
          </Button>
          {error && <div className="register-form__error">{error}</div>}
        </div>
      </form>

      <p className="register-form__footer">
        Already have an account?{" "}
        <Link href="/login" className="register-form__link">
          Sign in
        </Link>
      </p>
    </div>
  );
}
