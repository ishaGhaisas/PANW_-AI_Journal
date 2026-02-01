"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { Habits } from "@/lib/habits";
import type { ReflectionResponse } from "@/types/ai";

type JournalStateContextType = {
  habits: Habits;
  setHabits: (habits: Habits) => void;
  sleepHours: number | undefined;
  setSleepHours: (hours: number | undefined) => void;
  journalText: string;
  setJournalText: (text: string) => void;
  reflection: ReflectionResponse | null;
  setReflection: (reflection: ReflectionResponse | null) => void;
};

const JournalStateContext = createContext<JournalStateContextType | undefined>(undefined);

/**
 * Provider component that manages journal-related state (habits, sleep, text, reflection)
 */
export function JournalStateProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habits>({});
  const [sleepHours, setSleepHours] = useState<number | undefined>(undefined);
  const [journalText, setJournalText] = useState("");
  const [reflection, setReflection] = useState<ReflectionResponse | null>(null);

  return (
    <JournalStateContext.Provider
      value={{
        habits,
        setHabits,
        sleepHours,
        setSleepHours,
        journalText,
        setJournalText,
        reflection,
        setReflection,
      }}
    >
      {children}
    </JournalStateContext.Provider>
  );
}

/**
 * Hook to access journal state context
 */
export function useJournalState() {
  const context = useContext(JournalStateContext);
  if (context === undefined) {
    throw new Error("useJournalState must be used within JournalStateProvider");
  }
  return context;
}
