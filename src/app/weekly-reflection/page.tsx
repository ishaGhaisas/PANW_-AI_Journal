"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRouter } from "next/navigation";
import type { WeeklyReflectionResponse } from "@/types/ai";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import Button from "@/components/ui/Button";
import Header from "@/components/layout/Header";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function WeeklyReflectionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [reflection, setReflection] = useState<WeeklyReflectionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadWeeklyReflection = async () => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/ai/weekly-reflection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.uid }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load weekly reflection");
      }

      const data = (await response.json()) as WeeklyReflectionResponse;
      setReflection(data);
    } catch (err: any) {
      setError(err.message || "Failed to load weekly reflection");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-load on mount
    if (user) {
      loadWeeklyReflection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--color-paper)]">
        <Header />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
          <div className="mb-4 sm:mb-6 flex items-center gap-2 sm:gap-4">
            <Button
              onClick={() => router.push("/")}
              variant="ghost"
              className="text-sm"
            >
              ← Back
            </Button>
            <h1 className="font-journal text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wide text-[var(--color-text)]">
              Weekly Reflection
            </h1>
          </div>

          {loading && (
            <div className="rounded-lg bg-[var(--color-shell)] p-12">
              <LoadingState />
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-[var(--color-shell)] p-8">
              <ErrorState message={error} />
              <Button
                onClick={loadWeeklyReflection}
                variant="secondary"
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          )}

          {!loading && !error && !reflection && (
            <div className="rounded-lg bg-[var(--color-shell)] p-8 text-center">
              <p className="mb-4 text-[var(--color-muted)]">
                No reflection available yet. You need at least 1 entry to generate a weekly reflection.
              </p>
              <Button
                onClick={loadWeeklyReflection}
                variant="secondary"
              >
                Generate Reflection
              </Button>
            </div>
          )}

          {!loading && !error && reflection && (
            <div className="rounded-lg bg-[var(--color-shell)] p-4 sm:p-6 md:p-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                  Your Week in Review
                </h2>
                <Button
                  onClick={loadWeeklyReflection}
                  variant="ghost"
                  className="text-xs"
                >
                  Refresh
                </Button>
              </div>

              <div className="space-y-8">
                {/* Themes */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                    Themes
                  </h3>
                  <p
                    className="font-journal text-base leading-relaxed text-[var(--color-text)]"
                    style={{ fontFamily: "var(--font-journal)" }}
                  >
                    {reflection.themes}
                  </p>
                </div>

                {/* Mood Patterns */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                    Mood Patterns
                  </h3>
                  <p
                    className="font-journal text-base leading-relaxed text-[var(--color-text)]"
                    style={{ fontFamily: "var(--font-journal)" }}
                  >
                    {reflection.moodPatterns}
                  </p>
                </div>

                {/* Encouragement */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                    Encouragement
                  </h3>
                  <p
                    className="font-journal text-base leading-relaxed text-[var(--color-text)] italic"
                    style={{ fontFamily: "var(--font-journal)" }}
                  >
                    {reflection.encouragement}
                  </p>
                </div>

                {/* Goal Progress */}
                {reflection.goalProgress && (
                  <div className="rounded-lg bg-[var(--color-accent)]/10 p-4 border border-[var(--color-accent)]/20">
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-accent)]">
                      Goal Progress
                    </h3>
                    <p
                      className="font-journal text-base leading-relaxed text-[var(--color-text)]"
                      style={{ fontFamily: "var(--font-journal)" }}
                    >
                      {reflection.goalProgress}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
