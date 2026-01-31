import JournalEditor from "@/components/journal/JournalEditor";
import PastEntries from "@/components/journal/PastEntries";
import HabitsTracker from "@/components/journal/HabitsTracker";
import SleepTracker from "@/components/journal/SleepTracker";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
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
              <JournalEditor />
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
  );
}
