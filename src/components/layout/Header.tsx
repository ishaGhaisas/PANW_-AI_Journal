"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import Button from "@/components/ui/Button";

export default function Header() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  return (
    <header className="w-full border-b border-[var(--color-shell)] bg-[var(--color-paper)]">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between">
          <h1
            className="font-journal text-2xl font-bold text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-journal)" }}
          >
            BuJo AI
          </h1>
          {user && (
            <Button variant="ghost" onClick={handleLogout} className="text-sm">
              Sign out
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
