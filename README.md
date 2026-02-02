> This document serves as the complete design and technical documentation for the project.

# Getting Started

## Try the Web App

The app is deployed and available at: **[https://panw-ai-journal.vercel.app/login](https://panw-ai-journal.vercel.app/login)**

Simply create an account and start journaling!

## Running Locally

### Prerequisites

- Node.js 18+ and npm
- Firebase project (for database and authentication)
- Google Gemini API key (for AI reflections)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/ishaGhaisas/PANW_-AI_Journal.git
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file with the following variables:

   **Firebase Configuration** (get these from Firebase Console → Project Settings → Your apps):
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

   **AI Configuration** (get from [Google AI Studio](https://aistudio.google.com/app/apikey)):
   ```env
   AI_API_KEY=your-gemini-api-key
   ```

   **Firebase Admin SDK** (for server-side operations, get from Firebase Console → Project Settings → Service Accounts):
   ```env
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-service-account-email
   FIREBASE_PRIVATE_KEY=your-private-key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Seed Data (Optional)

To populate your database with sample journal entries, habits, and goals for testing:

1. **Create a user account** through the app (register/login)

2. **Get your user ID**:
   - Open browser DevTools → Console
   - After logging in, run: `firebase.auth().currentUser.uid` (or check Firebase Console → Authentication)

3. **Call the seed endpoint**:
   ```bash
   curl -X POST http://localhost:3000/api/seed \
     -H "Content-Type: application/json" \
     -d '{"userId": "your-user-id-here"}'
   ```

   Or use a tool like Postman/Insomnia, or visit:
   ```
   http://localhost:3000/api/seed
   ```
   with a POST request body: `{"userId": "your-user-id-here"}`

   This will create:
   - **7-8 journal entries** backdated from today (with reflections, moods, habits, sleep data)
   - **4 habits** (Morning walk, Read for 30 min, Meditation, Exercise)
   - **4 goals** (2 weekly, 2 monthly)

   > **Note**: The seed script can be run multiple times, but it will create duplicate entries. For a clean slate, delete existing data from Firebase Console first.

---

# Design Goals

## Why this problem?

Journaling has been a long-term habit for me, especially as a way to process emotions and reflect on patterns over time. But even for people who want to journal, consistency is hard. The biggest challenges are blank page anxiety, not knowing what to write, and not being able to meaningfully reflect on past entries.

Many tools either feel like empty text editors, or they become overly analytical and clinical. I wanted to build something in between.

I have been bullet journaling for a while and that's why I chose bullet journaling as the foundation. Bullet journaling lowers pressure as entries don't have to be long, structure is flexible, and patterns emerge naturally over time. The name **BuJo AI** comes from that. BuJo is short for bullet journal.


This project is designed as an **AI-augmented bullet journal**, not a productivity app, not a chatbot, and not a clinical mental-health tool.

The design goals below are **non-negotiable** and guided every product, UX, and technical decision.

## Design Goals

- **Calm and non-clinical**  
  The interface should feel safe, quiet, and reflective — closer to a personal notebook than a software product.

- **Feels like a bullet journal, not an app**  
  Structured, intentional logging (entries, habits, mood, goals) without gamification, streak pressure, or dashboards.

- **AI stays in the background**  
  AI assists reflection but never dominates the experience or replaces the user’s voice.

- **User is always in control**  
  AI outputs are suggestions, not facts. Users can override or ignore them at any time.

- **Mobile-first, iPad-friendly**  
  Designed primarily for quick daily journaling on mobile, with a more spacious split-view experience on iPad.

---

# Design System

## Typography

### Fonts

- **Journal Text**: Libre Baskerville (serif)  
  Used for journal entries, headings, and any text that represents the user's personal writing. The serif font evokes the analog, notebook-like quality of a bullet journal.

- **UI Elements**: Roboto Condensed (sans-serif)  
  Used for all interface elements, labels, buttons, and navigation. The condensed sans-serif provides clarity and modern functionality without competing with the journal content.

**Why these fonts?**
- Libre Baskerville creates a warm, readable serif that feels like writing in a physical journal
- Roboto Condensed provides clean, space-efficient UI text that doesn't distract from the journaling experience
- The contrast between serif (personal) and sans-serif (functional) reinforces the separation between user content and app interface

## Colors

### Color Palette

- **Paper**: `#FAF9F7` - Main background color (warm off-white)  
  Mimics the texture and warmth of physical paper, reducing screen fatigue and creating a calm environment.

- **Shell**: `#F1F0EE` - Secondary background for cards/sections  
  Slightly darker than paper, used to create subtle depth and separation between content areas without harsh borders.

- **Text**: `#1F1F1F` - Primary text color (dark gray, not pure black)  
  Softer than pure black for reduced eye strain while maintaining excellent readability.

- **Muted**: `#7A7A7A` - Secondary/muted text color  
  Used for labels, timestamps, and less important information that shouldn't compete with journal content.

- **Accent**: `#64748B` - Slate blue accent color  
  Used sparingly for interactive elements, links, and subtle highlights. Blue was chosen for its calming, trustworthy associations.

**Why these colors?**
- The warm, paper-like palette reduces digital screen harshness
- Low contrast backgrounds (paper/shell) create visual hierarchy without aggressive borders
- Muted text colors prevent information overload
- The accent color is used minimally to maintain the calm, non-clinical aesthetic

**Design principles applied:**
- No pure black or white (reduces eye strain)
- Warm tones throughout (feels personal, not clinical)
- Minimal use of accent color (keeps focus on content)
- High contrast for text readability (accessibility)

---

# Screen List & Information Architecture

The app intentionally uses a **small number of focused screens**. Each screen exists to support reflection, not navigation complexity.

## 1. Authentication

### Login  
### Register  

**Why this exists**
- Journaling is deeply personal; authentication establishes privacy and trust.
- Even a simple email/password flow signals that entries are user-owned and protected.

---

## 2. Today (Primary Screen)

**Contains**
- Journal entry editor  
- Mood (AI-suggested + manual override)  
- Habits (daily checkmarks)  
- Sleep (manual input)  
- Reflect button  
- AI output (reflection, mood suggestion, follow-up question)

**Why this screen exists**
- This is the core daily ritual.
- Everything needed for one day of journaling lives in one place.
- Mirrors how a bullet journal combines writing, tracking, and reflection on a single page.

**Why this is the primary screen**
- Journaling should start immediately, not after navigating menus.
- Reduces “blank page anxiety” by minimizing steps.

---

## 3. Past Entries

**Contains**
- Chronological list of past entries
- Date, preview line, and mood indicator

**Why this screen exists**
- Enables gentle review and self-reflection over time.
- Acts as the bullet journal “index”.

---

## 4. Weekly Reflection

**Contains**
- AI-generated narrative summary of the past week
- Themes, emotional patterns, and gentle observations

**Why this screen exists**
- Humans struggle to identify patterns across days.
- Weekly reflection provides higher-level insight without requiring manual analysis.

**Why weekly (not daily analytics)**
- Encourages perspective, not over-analysis.
- Avoids turning journaling into a performance metric.

---

## 5. Goals (Weekly | Monthly)

**Contains**
- Weekly goals
- Monthly goals
- AI-generated encouragement and positive reinforcement (mentioned in daily/weekly reflections)

**Why this screen exists**
- Bullet journaling often combines reflection with intention-setting.
- Goals provide direction without pressure.
- AI reflections mention goal progress organically.

**Interaction Design**
- Two distinct sections: "THIS WEEK" and "THIS MONTH"
- Inline "+ jot a goal" inputs (no separate form)
- Click to edit, hover × to delete
- No explicit save/cancel buttons (auto-saves on blur/Enter)

---

## 6. Insights Dashboard

**Contains**
- Mood trends visualization (bar chart)
- Recurring themes detection (keyword-based)
- Gentle correlations (sleep vs mood, habits vs mood)

**Why this screen exists**
- Provides visual patterns without clinical analysis
- All processing happens client-side (privacy-first)
- Helps users notice patterns they might miss

**Privacy-First Approach**
- No data sent to external APIs for analysis
- Rule-based theme detection (not ML)
- Observational statements (not prescriptive)


---

## Why Other Ideas Are Intentionally Excluded (For Now)

The following ideas were considered but intentionally deferred at this stage:

- Shared journals (couples, friends, families)  
- Social features or comparisons  
- Notifications and reminders  

**Reason for exclusion**
- They increase complexity and cognitive load.
- They risk shifting the product away from reflection toward optimization or performance.
- The current scope prioritizes emotional safety, clarity, and demo reliability.

These ideas are documented as **future enhancements**, not MVP features.

---

# User Flow Design

## Primary Daily Flow (Demo Flow)
Login
→ Open Today
→ Write journal entry
→ Tap Reflect
→ Read AI reflection
→ Adjust mood
→ Check habits
→ Save

---

## Why AI Comes After Writing

- Writing captures **raw, unfiltered emotion**.
- Introducing AI too early risks:
  - Steering the user’s thoughts
  - Influencing emotional expression
  - Breaking the journaling ritual


AI responds to the user, it never leads them.

---

## Why Mood Is Editable

- AI sentiment analysis can be wrong or incomplete.
- Emotional states are subjective and contextual.
- Users should never feel “classified” by the system.

---

# Technical Architecture

## Component Architecture

**Pages are Server Components**  
All Next.js pages (`app/*/page.tsx`) are Server Components by default. This enables:
- Server-side data fetching
- Reduced client-side JavaScript bundle
- Better SEO and initial page load performance
- Direct access to server resources (databases, APIs)

**Embedded Components Can Be Client Components**  
Components used within pages can be Client Components (marked with `"use client"`) when they need:
- Interactivity (onClick, onChange handlers)
- Browser APIs (localStorage, window)
- React hooks (useState, useEffect)
- Real-time updates

**Why this pattern?**
- Leverages Next.js App Router's server-first approach
- Minimizes JavaScript sent to the client
- Keeps pages fast and SEO-friendly
- Allows interactivity only where needed

**Example:**
```tsx
import JournalEditor from "@/components/journal/JournalEditor";

export default function JournalPage() {
  return <JournalEditor />;
}
```

## Tech Stack

### Frontend Framework
- **Next.js 16.1.6** (App Router)
  - **Why**: Server Components by default reduce client-side JavaScript, improve performance, and enable direct server-side data fetching
  - **App Router**: Modern routing with layouts, loading states, and error boundaries
  - **Tradeoff**: Learning curve vs. performance benefits (chose performance)

- **React 19.2.3**
  - **Why**: Industry standard, excellent ecosystem, Server Components support
  - **Tradeoff**: Considered Vue/Svelte but React's Next.js integration is superior

- **TypeScript 5**
  - **Why**: Type safety catches errors early, improves developer experience, better IDE support
  - **Tradeoff**: Slight development overhead vs. runtime error prevention (chose type safety)

### Styling
- **Tailwind CSS v4**
  - **Why**: Utility-first approach enables rapid development, consistent design system, small bundle size
  - **Tradeoff**: Considered CSS Modules or styled-components but Tailwind's developer experience and performance won
  - **BEM Naming**: Used for component CSS files to maintain organization

### Backend & Database
- **Firebase 12.8.0** (Client SDK)
  - **Why**: 
    - Managed authentication (Email/Password) - no need to build auth system
    - Firestore provides real-time updates, offline support, and automatic scaling
    - Fast development cycle, no backend infrastructure to manage
  - **Tradeoff**: Vendor lock-in vs. development speed (chose speed for MVP)
  - **Security**: Firestore security rules ensure user data isolation

- **Firebase Admin SDK 13.6.0** (Server SDK)
  - **Why**: Required for server-side API routes to access Firestore without user authentication
  - **Use Case**: AI reflection endpoints need to read user data server-side
  - **Security**: Bypasses security rules (server-side only, never exposed to client)

### AI Integration
- **Google Gemini 2.5 Flash**
  - **Why**: 
    - Free tier available (cost-effective for MVP)
    - Good balance of speed and quality
    - Supports structured JSON output
    - High token limits (4000 max output tokens)
  - **Tradeoff**: Considered OpenAI GPT-4o-mini but switched due to quota issues; Gemini's free tier is more reliable
  - **Prompt Engineering**: Custom prompts ensure empathetic, non-clinical responses

### Development Tools
- **ESLint** - Code quality and consistency
- **Next.js ESLint Config** - Framework-specific best practices

---

## Why This Tech Stack?

**Decision Framework:**
1. **Development Speed** - Firebase eliminates backend infrastructure
2. **Performance** - Next.js Server Components minimize client JavaScript
3. **Type Safety** - TypeScript prevents runtime errors
4. **Developer Experience** - Tailwind enables rapid UI development
5. **Cost** - Firebase free tier + Gemini free tier = minimal costs for MVP
6. **Scalability** - Firebase auto-scales, Next.js handles traffic well

**Alternatives Considered:**
- **Backend**: Supabase
  - **Chose Firebase**: Best managed auth + database combo, fastest to implement
- **AI**: OpenAI GPT-4o-mini, Anthropic Claude
  - **Chose Gemini**: Free tier, reliable, good quality

---

## Data Model

### Firestore Collections

#### `journalEntries`
```typescript
{
  userId: string;
  date: Timestamp;
  text: string;
  moodSuggested: string;
  moodManual?: string;
  reflection: string;
  followUpQuestion: string;
  followUpResponse?: string;
  habits?: Record<string, boolean>;
  sleepHours?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `goals`
```typescript
{
  userId: string;
  type: "weekly" | "monthly";
  text: string;
  isCompleted: boolean;
  isDeleted?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `userHabits`
```typescript
{
  userId: string;
  habits: Array<{
    id: string;
    label: string;
    createdAt: Timestamp;
  }>;
  updatedAt: Timestamp;
}
```

**Why this structure?**
- User-scoped queries (`userId` field) ensure data isolation
- Soft deletes for goals preserve data integrity
- Optional fields (`habits`, `sleepHours`) don't require all users to track everything
- Timestamps enable chronological sorting and filtering

---

## API Routes

### `/api/ai/reflect` (POST)
**Purpose**: Generate AI reflection on a journal entry

**Input**:
```typescript
{
  journalText: string;
  userId?: string;
}
```

**Output**:
```typescript
{
  reflection: string;
  mood: string;
  followUpQuestion: string;
  goalMention?: string;
}
```

**Features**:
- Context-aware (uses recent entries and goals)
- Fallback responses if AI fails
- Robust error handling for token limits
- Partial JSON parsing for truncated responses

### `/api/ai/weekly-reflection` (POST)
**Purpose**: Generate weekly narrative summary

**Input**:
```typescript
{
  userId: string;
}
```

**Output**:
```typescript
{
  themes: string;
  moodPatterns: string;
  encouragement: string;
  goalProgress?: string;
}
```

**Features**:
- Analyzes last 7 entries
- Includes habits and goals context
- Narrative format (not statistical)
- Fallback responses if AI fails

### `/api/ai/list-models` (GET)
**Purpose**: List available Gemini models (for debugging)

---

## Environment Variables

### Required for Development

**Client-Side (NEXT_PUBLIC_*)**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

**Server-Side**
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-private-key
AI_API_KEY=your-gemini-api-key
```

> **Note**: `FIREBASE_PRIVATE_KEY` should include the full key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines, with `\n` for newlines when setting in Vercel or other deployment platforms.

---

## Code Quality Principles

### DRY (Don't Repeat Yourself)
- Utility functions centralized in `lib/utils/`
- API client abstraction in `lib/api/client.ts`
- Constants centralized in `lib/constants/index.ts`
- Type exports centralized in `types/index.ts`

### Separation of Concerns
- Each component has its own CSS file
- Business logic in `lib/`, UI in `components/`
- Server-side functions separate from client-side (`*.server.ts`)

### Documentation
- JSDoc comments on all functions
- Type definitions for all data structures
- README documents design decisions

### Error Handling
- Centralized error handler (`lib/utils/errorHandler.ts`)
- User-friendly error messages
- Graceful fallbacks for AI failures

### CSS Organization
- BEM naming convention for all CSS classes
- Separate CSS files for each component
- CSS variables for design tokens

---

## Security & Privacy

### Authentication
- Firebase Email/Password authentication
- Protected routes with `ProtectedRoute` component
- User-scoped data queries (`where("userId", "==", userId)`)

### Data Privacy
- **Client-Side Analytics**: Insights computed on-device, no external APIs
- **Secure Storage**: Firestore with security rules
- **User Data Isolation**: All queries filtered by `userId`
- **No Data Sharing**: No social features, no data export to third parties

### AI Disclaimer
Explicit disclaimer shown to users:
> "AI reflection is for self-reflection assistance only. Not a substitute for professional mental health care or diagnosis. Your journal entries are encrypted and stored securely."


---

## Deployment

### Platform: Vercel
- Automatic deployments from GitHub
- Environment variables configured in Vercel dashboard
- Serverless functions for API routes

### Performance

A Lighthouse performance audit was conducted on the deployed application. The results show excellent scores across all metrics:

![Lighthouse Report](./lighthouse-report.png)

**Scores:**
- **Performance**: 99/100
- **Accessibility**: 96/100
- **Best Practices**: 96/100
- **SEO**: 100/100

> **Note**: Lighthouse report screenshot is included in the repository root for reference.

## Project Structure

```
ai_journal/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth routes
│   │   ├── api/               # API routes
│   │   ├── insights/          # Insights page
│   │   ├── weekly-reflection/ # Weekly reflection page
│   │   └── page.tsx           # Main journal page
│   ├── components/
│   │   ├── auth/              # Authentication components
│   │   ├── journal/           # Journal components
│   │   ├── layout/            # Layout components
│   │   └── ui/                # Reusable UI components
│   ├── lib/
│   │   ├── ai/                # AI prompts
│   │   ├── api/               # API client
│   │   ├── auth/              # Auth utilities
│   │   ├── constants/         # Constants
│   │   ├── firebase/          # Firestore utilities
│   │   ├── habits.ts          # Habit types
│   │   ├── insights/           # Client-side analytics
│   │   ├── moods.ts            # Mood definitions
│   │   ├── moodCategories.ts  # Mood categorization
│   │   └── utils/             # Utility functions
│   └── types/                 # TypeScript types
├── public/                     # Static assets
├── package.json
├── tsconfig.json
└── README.md
```

---

## Features Summary

### Implemented Features

1. **Daily Journaling**
   - Bullet journal-style editor with dotted background
   - AI reflection with empathetic responses
   - Context-aware follow-up questions
   - Auto-clears after saving

2. **Mood Tracking**
   - 12 predefined moods
   - 5 color-coded categories
   - AI-suggested + manual override

3. **Habit Tracking**
   - User-defined habits
   - Bullet dots (○/●) style
   - Daily completion tracking

4. **Sleep Tracking**
   - Manual hours input
   - Auto-save functionality

5. **Goals Management**
   - Weekly & Monthly goals
   - Inline add/edit/delete
   - AI integration

6. **Past Entries**
   - Chronological list
   - Color-coded mood indicators
   - Detail modal

7. **Weekly Reflection**
   - AI-generated narrative summary
   - Themes, patterns, encouragement
   - Appears after every 7 days

8. **Insights Dashboard**
   - Client-side analytics
   - Mood trends visualization
   - Theme detection
   - Correlations

9. **Authentication**
   - Email/Password auth
   - Protected routes
   - Error handling

### Future Enhancements (Documented, Not Implemented)

- Shared journals (couples, families)
- Social features
- Notifications and reminders

