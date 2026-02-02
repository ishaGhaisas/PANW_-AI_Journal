import { NextRequest, NextResponse } from "next/server";
import { Timestamp, collection, addDoc } from "firebase/firestore";
import { saveGoal } from "@/lib/firebase/goals";
import { saveUserHabits, generateHabitId } from "@/lib/firebase/userHabits";
import { getTodayStart } from "@/lib/utils/dates";
import { db } from "@/lib/firebase/config";
import { FIREBASE_COLLECTIONS } from "@/lib/constants";
import type { JournalEntryInput } from "@/types/journal";
import type { GoalInput } from "@/types/goals";
import type { UserHabits } from "@/lib/habits";

/**
 * Seed data script for testing/demo purposes
 * Creates 7-8 journal entries backdated from today, habits, and goals for a user
 * 
 * Usage: POST /api/seed with { userId: "your-user-id" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const results = {
      entries: [] as Array<{ date: string; success: boolean; id?: string; error?: string }>,
      habits: { success: false, error: "" as string | undefined },
      goals: [] as Array<{ type: string; text: string; success: boolean; id?: string; error?: string }>,
    };

    // Create habits first (needed for entries)
    const habits: UserHabits = [
      { id: generateHabitId(), label: "Morning walk" },
      { id: generateHabitId(), label: "Read for 30 min" },
      { id: generateHabitId(), label: "Meditation" },
      { id: generateHabitId(), label: "Exercise" },
    ];

    try {
      await saveUserHabits(userId, habits);
      results.habits.success = true;
    } catch (error: unknown) {
      results.habits.success = false;
      results.habits.error = error instanceof Error ? error.message : "Unknown error";
    }

    // Create goals
    const goalsToCreate: GoalInput[] = [
      { type: "weekly", text: "Complete morning routine 5 days this week" },
      { type: "weekly", text: "Finish reading current book" },
      { type: "monthly", text: "Establish consistent exercise routine" },
      { type: "monthly", text: "Improve work-life balance" },
    ];

    for (const goal of goalsToCreate) {
      try {
        const goalId = await saveGoal(userId, goal);
        results.goals.push({
          type: goal.type,
          text: goal.text,
          success: true,
          id: goalId,
        });
      } catch (error: unknown) {
        results.goals.push({
          type: goal.type,
          text: goal.text,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Create journal entries (7-8 entries backdated from today)
    const today = getTodayStart();
    const entryTexts = [
      {
        text: "Started the week feeling a bit overwhelmed with work. Had a lot on my plate but trying to stay positive. Met with my team and we made some good progress on the project.",
        mood: "Overwhelmed",
        reflection: "It sounds like you're navigating a busy period with grace. Balancing multiple responsibilities while staying positive shows resilience. Remember that progress, even small steps, is still progress.",
        followUpQuestion: "What helps you feel more grounded when work feels overwhelming?",
        sleepHours: 6.5,
        habits: { [habits[0].id]: true, [habits[2].id]: true },
      },
      {
        text: "Feeling more calm today. Took a walk in the morning and it really helped clear my mind. The weather was nice and I saw some birds. Sometimes the simple things make the biggest difference.",
        mood: "Calm",
        reflection: "I'm glad you found peace in that morning walk. Nature has a way of grounding us and helping us reconnect with what matters. Those small moments of noticing—the birds, the weather—can be so restorative.",
        followUpQuestion: "What other simple activities bring you a sense of peace?",
        sleepHours: 7.5,
        habits: { [habits[0].id]: true, [habits[1].id]: true, [habits[2].id]: true },
      },
      {
        text: "Had a difficult conversation with a friend today. It was hard but necessary. I'm grateful we could talk things through honestly. Relationships take work but they're worth it.",
        mood: "Reflective",
        reflection: "Having difficult conversations takes courage, and it sounds like you handled it with care. Being able to work through challenges together is a sign of a strong friendship. Your willingness to engage honestly shows maturity.",
        followUpQuestion: "What did you learn about yourself from that conversation?",
        sleepHours: 8,
        habits: { [habits[1].id]: true },
      },
      {
        text: "Feeling anxious about an upcoming presentation. I've prepared but still nervous. Trying to remind myself that I've done this before and I can do it again. Deep breaths.",
        mood: "Anxious",
        reflection: "It's completely normal to feel nervous before something important. Your preparation shows you care, and that care is what will help you succeed. Those deep breaths are a good reminder to be kind to yourself.",
        followUpQuestion: "What has helped you feel more confident in past presentations?",
        sleepHours: 6,
        habits: { [habits[2].id]: true, [habits[3].id]: true },
      },
      {
        text: "Presentation went well! I was nervous but once I started, I found my flow. Got good feedback and felt proud of myself. Celebrating this small win.",
        mood: "Excited",
        reflection: "Congratulations on pushing through your nerves and delivering! It's wonderful that you're taking time to celebrate this achievement. Acknowledging your successes, even the small ones, is so important.",
        followUpQuestion: "How do you want to celebrate this accomplishment?",
        sleepHours: 7,
        habits: { [habits[0].id]: true, [habits[3].id]: true },
      },
      {
        text: "Feeling grateful today. Had coffee with a colleague and we talked about life, not just work. It reminded me how important connection is. Also finished a book I've been reading for weeks.",
        mood: "Grateful",
        reflection: "Those moments of genuine connection are so valuable. It sounds like you're finding balance between work and personal connection, which can be challenging. Finishing that book must feel satisfying too.",
        followUpQuestion: "What did you take away from the book you finished?",
        sleepHours: 8.5,
        habits: { [habits[1].id]: true, [habits[2].id]: true },
      },
      {
        text: "Tired today. It's been a long week but I'm feeling hopeful about the weekend. Planning to rest and maybe do something creative. Sometimes slowing down is exactly what I need.",
        mood: "Tired",
        reflection: "Rest is productive, and it sounds like you're listening to what your body and mind need. Planning for rest and creativity is a beautiful way to honor yourself. The weekend will be a good reset.",
        followUpQuestion: "What creative activity are you most looking forward to?",
        sleepHours: 7.5,
        habits: { [habits[0].id]: true },
      },
      {
        text: "Weekend was exactly what I needed. Spent time outdoors, caught up on sleep, and did some painting. Feeling refreshed and ready for the week ahead. Sometimes taking a break is the most productive thing you can do.",
        mood: "Refreshed",
        reflection: "It sounds like you gave yourself exactly what you needed. Taking intentional time for rest and creativity is a form of self-care that often gets overlooked. Coming back refreshed shows the value of those breaks.",
        followUpQuestion: "What from this weekend do you want to carry into the week?",
        sleepHours: 9,
        habits: { [habits[0].id]: true, [habits[1].id]: true, [habits[2].id]: true },
      },
    ];

    // Create entries backdated from today
    for (let i = 0; i < entryTexts.length; i++) {
      const daysAgo = entryTexts.length - 1 - i; // Most recent entry is today, oldest is 7 days ago
      const entryDate = new Date(today);
      entryDate.setDate(entryDate.getDate() - daysAgo);
      entryDate.setHours(12, 0, 0, 0); // Set to noon for consistency

      const entryData: JournalEntryInput = {
        text: entryTexts[i].text,
        reflection: {
          reflection: entryTexts[i].reflection,
          mood: entryTexts[i].mood,
          followUpQuestion: entryTexts[i].followUpQuestion,
        },
        sleepHours: entryTexts[i].sleepHours,
        habits: entryTexts[i].habits,
      };

      try {
        // Directly save to Firestore with custom date (since saveJournalEntry uses today's date)
        const now = Timestamp.now();
        const entry: Record<string, unknown> = {
          userId,
          date: Timestamp.fromDate(entryDate),
          text: entryData.text,
          moodSuggested: entryData.reflection.mood,
          reflection: entryData.reflection.reflection,
          followUpQuestion: entryData.reflection.followUpQuestion,
          sleepHours: entryData.sleepHours,
          habits: entryData.habits,
          createdAt: now,
          updatedAt: now,
        };

        const docRef = await addDoc(collection(db, FIREBASE_COLLECTIONS.JOURNAL_ENTRIES), entry);
        results.entries.push({
          date: entryDate.toLocaleDateString(),
          success: true,
          id: docRef.id,
        });
      } catch (error: unknown) {
        results.entries.push({
          date: entryDate.toLocaleDateString(),
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const entrySuccessCount = results.entries.filter((e) => e.success).length;
    const entryFailCount = results.entries.filter((e) => !e.success).length;
    const goalSuccessCount = results.goals.filter((g) => g.success).length;
    const goalFailCount = results.goals.filter((g) => !g.success).length;

    return NextResponse.json(
      {
        message: `Seed data created for user ${userId}`,
        summary: {
          entries: `${entrySuccessCount} created, ${entryFailCount} failed`,
          habits: results.habits.success ? "Created successfully" : `Failed: ${results.habits.error}`,
          goals: `${goalSuccessCount} created, ${goalFailCount} failed`,
        },
        results,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to seed data";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
