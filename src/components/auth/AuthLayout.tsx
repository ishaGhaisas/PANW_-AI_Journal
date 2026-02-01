import "./AuthLayout.css";

type AuthLayoutProps = {
  children: React.ReactNode;
};

/**
 * Layout component for authentication pages with split-screen design
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-layout">
      <div className="auth-layout__branding">
        <div className="auth-layout__branding-content">
          <h1 className="auth-layout__branding-title">BuJo AI</h1>
          <p className="auth-layout__branding-description">
            A bullet journal-inspired app with AI-powered reflection. Write freely,
            reflect meaningfully, and understand yourself better—one entry at a time.
          </p>
          <div className="auth-layout__branding-tagline">
            <p className="auth-layout__branding-tagline-text">Private • Calm • Intentional</p>
          </div>
        </div>
      </div>
      <div className="auth-layout__form-container">
        <div className="auth-layout__form-wrapper">{children}</div>
      </div>
    </div>
  );
}
