import JournalContainer from "@/components/journal/JournalContainer";
import PastEntries from "@/components/journal/PastEntries";
import HabitsTracker from "@/components/journal/HabitsTracker";
import SleepTracker from "@/components/journal/SleepTracker";
import GoalsTracker from "@/components/journal/GoalsTracker";
import Header from "@/components/layout/Header";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { JournalStateProvider } from "@/components/journal/JournalStateContext";
import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <ProtectedRoute>
      <JournalStateProvider>
        <div className="min-h-screen bg-[var(--color-paper)]">
          <Header />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
            {/* Main Content Area */}
            <div className="mb-6 sm:mb-8 text-center">
              <h1 className="font-journal text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-wide text-[var(--color-text)]">
                TODAY
              </h1>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
              {/* Left Sidebar - Past Entries */}
              <aside className="md:col-span-3 order-2 md:order-1">
                <PastEntries />
              </aside>

              {/* Main Journal Editor */}
              <main className="md:col-span-7 order-1 md:order-2">
                <div className="rounded-xl bg-[var(--color-shell)] p-4 sm:p-5 md:p-6 shadow-sm">
                  <JournalContainer />
                </div>
              </main>

              {/* Right Sidebar - Goals, Habits & Sleep */}
              <aside className="md:col-span-2 order-3">
                <div className="space-y-4 sm:space-y-6">
                  <GoalsTracker />
                  <HabitsTracker />
                  <SleepTracker />
                </div>
              </aside>
            </div>
          </div>
        </div>
      </JournalStateProvider>
    </ProtectedRoute>
  );
}
