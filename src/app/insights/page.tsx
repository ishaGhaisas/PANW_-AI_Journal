"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getUserJournalEntries } from "@/lib/firebase/journal";
import { analyzeMoodTrends, getMoodTrendDescription } from "@/lib/insights/moodTrends";
import { getTopThemes } from "@/lib/insights/themes";
import { analyzeSleepMoodCorrelation, analyzeHabitMoodCorrelation } from "@/lib/insights/correlations";
import { getMoodColor } from "@/lib/moodCategories";
import { logError } from "@/lib/utils/errorHandler";
import { isAuthenticated } from "@/lib/utils/validation";
import type { JournalEntry } from "@/types/journal";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import "./page.css";

const TOP_THEMES_LIMIT = 5;

/**
 * Main insights content component
 */
function InsightsContent() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated(user)) {
      loadEntries();
    }
  }, [user]);

  /**
   * Loads all journal entries for analysis
   */
  const loadEntries = async () => {
    if (!isAuthenticated(user)) return;
    try {
      setLoading(true);
      const allEntries = await getUserJournalEntries(user.uid);
      setEntries(allEntries);
    } catch (error) {
      logError("Failed to load entries", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="insights-page">
        <Header />
        <div className="insights-page__container">
          <p className="text-sm text-[var(--color-muted)]">Loading insights...</p>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="insights-page">
        <Header />
        <div className="insights-page__container">
          <div className="insights-page__empty">
            <h1 className="insights-page__empty-title">Insights</h1>
            <p className="insights-page__empty-text">
              Write a few entries to see your patterns and trends.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const moodTrends = analyzeMoodTrends(entries);
  const topThemes = getTopThemes(entries, TOP_THEMES_LIMIT);
  const sleepCorrelation = analyzeSleepMoodCorrelation(entries);
  const habitCorrelations = analyzeHabitMoodCorrelation(entries);

  return (
    <div className="insights-page">
      <Header />
      <div className="insights-page__container">
        <div className="insights-page__header">
          <Button href="/" variant="ghost" className="text-sm">
            ← Back
          </Button>
          <h1 className="insights-page__title">Insights</h1>
        </div>

        <div className="insights-page__sections">
          <section className="insights-page__section">
            <h2 className="insights-page__section-header">Emotional Patterns</h2>
            {moodTrends.length > 0 ? (
              <div className="insights-page__trends">
                {moodTrends.map((trend) => {
                  const maxCount = moodTrends[0].count;
                  const barWidth = maxCount > 0 ? (trend.count / maxCount) * 100 : 0;

                  return (
                    <div key={trend.category} className="insights-page__trend-item">
                      <div className="insights-page__trend-header">
                        <div className="insights-page__trend-label">
                          <span
                            className="insights-page__trend-dot"
                            style={{ backgroundColor: getMoodColor(trend.category) }}
                          />
                          <span className="insights-page__trend-text">{trend.label}</span>
                        </div>
                        <span className="insights-page__trend-count">{trend.count}</span>
                      </div>
                      <div className="insights-page__trend-bar-container">
                        <div
                          className="insights-page__trend-bar"
                          style={{
                            width: `${barWidth}%`,
                            backgroundColor: getMoodColor(trend.category),
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
                <p className="insights-page__trend-description">
                  {getMoodTrendDescription(moodTrends)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-[var(--color-muted)]">Not enough data yet.</p>
            )}
          </section>

          <section className="insights-page__section">
            <h2 className="insights-page__section-header">Recurring Themes</h2>
            {topThemes.length > 0 ? (
              <div>
                <div className="insights-page__themes-container">
                  {topThemes.map((theme) => (
                    <span key={theme.id} className="insights-page__theme-tag">
                      {theme.label}
                    </span>
                  ))}
                </div>
                <p className="insights-page__themes-note">Based on patterns in your entries</p>
              </div>
            ) : (
              <p className="text-sm text-[var(--color-muted)]">No themes detected yet.</p>
            )}
          </section>

          {(sleepCorrelation || habitCorrelations.length > 0) && (
            <section className="insights-page__section">
              <h2 className="insights-page__section-header">Noticed Correlations</h2>
              <ul className="insights-page__correlations-list">
                {sleepCorrelation && (
                  <li className="insights-page__correlation-item">
                    • {sleepCorrelation.statement}
                  </li>
                )}
                {habitCorrelations.map((correlation, index) => (
                  <li key={index} className="insights-page__correlation-item">
                    • {correlation.statement}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="insights-page__privacy-note">
            <p className="insights-page__privacy-text">
              All analysis happens on your device. Journal text never leaves your device for trend analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Insights page with protected route wrapper
 */
export default function InsightsPage() {
  return (
    <ProtectedRoute>
      <InsightsContent />
    </ProtectedRoute>
  );
}
