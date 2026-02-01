import { NextRequest, NextResponse } from "next/server";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

const USER_ID = "E7KRgNsqjKZPwjMeHLoGjVN88R53";

const TEST_ENTRIES = [
  {
    userId: USER_ID,
    date: Timestamp.fromDate(new Date("2026-01-24T12:00:00Z")),
    text: "Started the week feeling a bit overwhelmed with work. Had a lot on my plate but trying to stay positive. Met with my team and we made some good progress on the project.",
    moodSuggested: "Overwhelmed",
    reflection: "It sounds like you're navigating a busy period with grace. Balancing multiple responsibilities while staying positive shows resilience. Remember that progress, even small steps, is still progress.",
    followUpQuestion: "What helps you feel more grounded when work feels overwhelming?",
    createdAt: Timestamp.fromDate(new Date("2026-01-24T12:00:00Z")),
    updatedAt: Timestamp.fromDate(new Date("2026-01-24T12:00:00Z")),
    sleepHours: 6.5,
  },
  {
    userId: USER_ID,
    date: Timestamp.fromDate(new Date("2026-01-25T14:00:00Z")),
    text: "Feeling more calm today. Took a walk in the morning and it really helped clear my mind. The weather was nice and I saw some birds. Sometimes the simple things make the biggest difference.",
    moodSuggested: "Calm",
    reflection: "I'm glad you found peace in that morning walk. Nature has a way of grounding us and helping us reconnect with what matters. Those small moments of noticing—the birds, the weather—can be so restorative.",
    followUpQuestion: "What other simple activities bring you a sense of peace?",
    createdAt: Timestamp.fromDate(new Date("2026-01-25T14:00:00Z")),
    updatedAt: Timestamp.fromDate(new Date("2026-01-25T14:00:00Z")),
    sleepHours: 7.5,
  },
  {
    userId: USER_ID,
    date: Timestamp.fromDate(new Date("2026-01-26T18:00:00Z")),
    text: "Had a difficult conversation with a friend today. It was hard but necessary. I'm grateful we could talk things through honestly. Relationships take work but they're worth it.",
    moodSuggested: "Reflective",
    reflection: "Having difficult conversations takes courage, and it sounds like you handled it with care. Being able to work through challenges together is a sign of a strong friendship. Your willingness to engage honestly shows maturity.",
    followUpQuestion: "What did you learn about yourself from that conversation?",
    createdAt: Timestamp.fromDate(new Date("2026-01-26T18:00:00Z")),
    updatedAt: Timestamp.fromDate(new Date("2026-01-26T18:00:00Z")),
    sleepHours: 8,
  },
  {
    userId: USER_ID,
    date: Timestamp.fromDate(new Date("2026-01-27T20:00:00Z")),
    text: "Feeling anxious about an upcoming presentation. I've prepared but still nervous. Trying to remind myself that I've done this before and I can do it again. Deep breaths.",
    moodSuggested: "Anxious",
    reflection: "It's completely normal to feel nervous before something important. Your preparation shows you care, and that care is what will help you succeed. Those deep breaths are a good reminder to be kind to yourself.",
    followUpQuestion: "What has helped you feel more confident in past presentations?",
    createdAt: Timestamp.fromDate(new Date("2026-01-27T20:00:00Z")),
    updatedAt: Timestamp.fromDate(new Date("2026-01-27T20:00:00Z")),
    sleepHours: 6,
  },
  {
    userId: USER_ID,
    date: Timestamp.fromDate(new Date("2026-01-28T19:00:00Z")),
    text: "Presentation went well! I was nervous but once I started, I found my flow. Got good feedback and felt proud of myself. Celebrating this small win.",
    moodSuggested: "Excited",
    reflection: "Congratulations on pushing through your nerves and delivering! It's wonderful that you're taking time to celebrate this achievement. Acknowledging your successes, even the small ones, is so important.",
    followUpQuestion: "How do you want to celebrate this accomplishment?",
    createdAt: Timestamp.fromDate(new Date("2026-01-28T19:00:00Z")),
    updatedAt: Timestamp.fromDate(new Date("2026-01-28T19:00:00Z")),
    sleepHours: 7,
  },
  {
    userId: USER_ID,
    date: Timestamp.fromDate(new Date("2026-01-29T16:00:00Z")),
    text: "Feeling grateful today. Had coffee with a colleague and we talked about life, not just work. It reminded me how important connection is. Also finished a book I've been reading for weeks.",
    moodSuggested: "Grateful",
    reflection: "Those moments of genuine connection are so valuable. It sounds like you're finding balance between work and personal connection, which can be challenging. Finishing that book must feel satisfying too.",
    followUpQuestion: "What did you take away from the book you finished?",
    createdAt: Timestamp.fromDate(new Date("2026-01-29T16:00:00Z")),
    updatedAt: Timestamp.fromDate(new Date("2026-01-29T16:00:00Z")),
    sleepHours: 8.5,
  },
  {
    userId: USER_ID,
    date: Timestamp.fromDate(new Date("2026-01-30T21:00:00Z")),
    text: "Tired today. It's been a long week but I'm feeling hopeful about the weekend. Planning to rest and maybe do something creative. Sometimes slowing down is exactly what I need.",
    moodSuggested: "Tired",
    reflection: "Rest is productive, and it sounds like you're listening to what your body and mind need. Planning for rest and creativity is a beautiful way to honor yourself. The weekend will be a good reset.",
    followUpQuestion: "What creative activity are you most looking forward to?",
    createdAt: Timestamp.fromDate(new Date("2026-01-30T21:00:00Z")),
    updatedAt: Timestamp.fromDate(new Date("2026-01-30T21:00:00Z")),
    sleepHours: 7.5,
  },
];

export async function GET(request: NextRequest) {
  try {
    const results = [];
    
    for (const entry of TEST_ENTRIES) {
      try {
        const docRef = await addDoc(collection(db, "journalEntries"), entry);
        results.push({
          success: true,
          date: entry.date.toDate().toLocaleDateString(),
          id: docRef.id,
        });
      } catch (error: any) {
        results.push({
          success: false,
          date: entry.date.toDate().toLocaleDateString(),
          error: error.message,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return NextResponse.json(
      {
        message: `Added ${successCount} entries. ${failCount} failed.`,
        results,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "Failed to add entries",
      },
      { status: 500 }
    );
  }
}
