"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import LoadingState from "@/components/ui/LoadingState";

type AuthRedirectProps = {
  children: React.ReactNode;
};

// Redirects authenticated users away from auth pages (login/register)
export default function AuthRedirect({ children }: AuthRedirectProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingState />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return <>{children}</>;
}
