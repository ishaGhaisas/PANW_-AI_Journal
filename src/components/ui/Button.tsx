"use client";

import Link from "next/link";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
};

export default function Button({
  children,
  onClick,
  href,
  variant = "primary",
  disabled = false,
  loading = false,
  type = "button",
  className = "",
}: ButtonProps) {
  const baseStyles =
    "px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";

  const variantStyles = {
    primary:
      "bg-[var(--color-accent)] text-white hover:opacity-90 focus:ring-[var(--color-accent)]",
    secondary:
      "bg-[var(--color-shell)] text-[var(--color-text)] hover:bg-[#DCDBD9] focus:ring-[var(--color-accent)]",
    ghost:
      "bg-transparent text-[var(--color-text)] hover:bg-[var(--color-shell)] focus:ring-[var(--color-accent)]",
  };

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${className}`;

  if (href) {
    return (
      <Link
        href={href}
        className={combinedClassName}
        onClick={disabled || loading ? (e) => e.preventDefault() : onClick}
      >
        {loading ? "Loading..." : children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={combinedClassName}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
