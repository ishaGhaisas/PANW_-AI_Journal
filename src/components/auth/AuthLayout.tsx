type AuthLayoutProps = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left Side - Branding */}
      <div className="hidden bg-[var(--color-shell)] lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12">
        <div className="max-w-md space-y-6 text-center">
          <h1
            className="font-journal text-5xl font-bold text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-journal)" }}
          >
            BuJo AI
          </h1>
          <p className="text-lg leading-relaxed text-[var(--color-muted)]">
            A bullet journal-inspired app with AI-powered reflection. Write freely,
            reflect meaningfully, and understand yourself better—one entry at a time.
          </p>
          <div className="pt-4">
            <p className="text-sm text-[var(--color-muted)]">
              Private • Calm • Intentional
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex flex-col items-center justify-center bg-[var(--color-paper)] p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
