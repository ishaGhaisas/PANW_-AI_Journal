"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getWeeklyReflection } from "@/lib/api/client";
import { getUserFriendlyError } from "@/lib/utils/errorHandler";
import { isAuthenticated } from "@/lib/utils/validation";
import type { WeeklyReflectionResponse } from "@/types/ai";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import Button from "@/components/ui/Button";
import "./WeeklyReflection.css";

/**
 * Component displaying AI-generated weekly reflection summary
 */
export default function WeeklyReflection() {
  const { user } = useAuth();
  const [reflection, setReflection] = useState<WeeklyReflectionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Loads weekly reflection from API
   */
  const loadWeeklyReflection = async () => {
    if (!isAuthenticated(user)) return;

    setLoading(true);
    setError("");

    try {
      const data = await getWeeklyReflection(user.uid);
      setReflection(data);
    } catch (err: unknown) {
      setError(getUserFriendlyError(err, "Failed to load weekly reflection"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated(user)) {
      loadWeeklyReflection();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="weekly-reflection">
        <h2 className="weekly-reflection__header">Weekly Reflection</h2>
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="weekly-reflection">
        <h2 className="weekly-reflection__header">Weekly Reflection</h2>
        <ErrorState message={error} />
        <Button
          onClick={loadWeeklyReflection}
          variant="secondary"
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!reflection) {
    return (
      <div className="weekly-reflection">
        <h2 className="weekly-reflection__header">Weekly Reflection</h2>
        <p className="weekly-reflection__empty">No reflection available yet.</p>
        <Button
          onClick={loadWeeklyReflection}
          variant="secondary"
          className="mt-4"
        >
          Generate Reflection
        </Button>
      </div>
    );
  }

  return (
    <div className="weekly-reflection">
      <div className="weekly-reflection__header-container">
        <h2 className="weekly-reflection__header">Weekly Reflection</h2>
        <Button
          onClick={loadWeeklyReflection}
          variant="ghost"
          className="text-xs"
        >
          Refresh
        </Button>
      </div>
      <div className="weekly-reflection__sections">
        <div className="weekly-reflection__section">
          <h3 className="weekly-reflection__section-header">Themes</h3>
          <p className="weekly-reflection__text">{reflection.themes}</p>
        </div>
        <div className="weekly-reflection__section">
          <h3 className="weekly-reflection__section-header">Mood Patterns</h3>
          <p className="weekly-reflection__text">{reflection.moodPatterns}</p>
        </div>
        <div className="weekly-reflection__section">
          <h3 className="weekly-reflection__section-header">Encouragement</h3>
          <p className="weekly-reflection__text weekly-reflection__text--italic">
            {reflection.encouragement}
          </p>
        </div>
      </div>
    </div>
  );
}
