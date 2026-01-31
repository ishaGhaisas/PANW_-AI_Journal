import JournalContainer from "@/components/journal/JournalContainer";
import PastEntries from "@/components/journal/PastEntries";
import HabitsTracker from "@/components/journal/HabitsTracker";
import SleepTracker from "@/components/journal/SleepTracker";
import Header from "@/components/layout/Header";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { JournalStateProvider } from "@/components/journal/JournalStateContext";

export default function Home() {
  return (
    <ProtectedRoute>
      <JournalStateProvider>
        <div className="min-h-screen bg-[var(--color-paper)]">
          <Header />
          <div className="mx-auto max-w-7xl px-4 py-8">
          {/* Main Content Area */}
          <div className="mb-8 text-center">
            <h1 className="font-journal text-5xl font-bold uppercase tracking-wide text-[var(--color-text)]">
              TODAY
            </h1>
          </div>

          {/* Layout Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Sidebar - Past Entries */}
            <aside className="lg:col-span-2">
              <PastEntries />
            </aside>

            {/* Main Journal Editor */}
            <main className="lg:col-span-8">
              <div className="min-h-[400px] rounded-lg bg-[var(--color-shell)] p-8">
                <JournalContainer />
              </div>
            </main>

            {/* Right Sidebar - Habits & Sleep */}
            <aside className="lg:col-span-2">
              <div className="space-y-6">
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
