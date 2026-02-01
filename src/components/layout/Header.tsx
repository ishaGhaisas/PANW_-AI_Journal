"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getUserFriendlyError, logError } from "@/lib/utils/errorHandler";
import Button from "@/components/ui/Button";
import "./Header.css";

/**
 * Application header with navigation and logout
 */
export default function Header() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  /**
   * Handles user logout
   */
  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      logError("Failed to sign out", error);
    }
  };

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__content">
          <h1 className="header__title">BuJo AI</h1>
          {user && (
            <div className="header__actions">
              <Button href="/insights" variant="ghost" className="text-sm">
                Insights
              </Button>
              <Button variant="ghost" onClick={handleLogout} className="text-sm">
                Sign out
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
