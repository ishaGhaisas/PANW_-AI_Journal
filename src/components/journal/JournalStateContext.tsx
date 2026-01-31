"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { Habits } from "@/lib/habits";

type JournalStateContextType = {
  habits: Habits;
  setHabits: (habits: Habits) => void;
  sleepHours: number | undefined;
  setSleepHours: (hours: number | undefined) => void;
};

const JournalStateContext = createContext<JournalStateContextType | undefined>(
  undefined
);

export function JournalStateProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habits>({});
  const [sleepHours, setSleepHours] = useState<number | undefined>(undefined);

  return (
    <JournalStateContext.Provider
      value={{
        habits,
        setHabits,
        sleepHours,
        setSleepHours,
      }}
    >
      {children}
    </JournalStateContext.Provider>
  );
}

export function useJournalState() {
  const context = useContext(JournalStateContext);
  if (context === undefined) {
    throw new Error("useJournalState must be used within JournalStateProvider");
  }
  return context;
}
