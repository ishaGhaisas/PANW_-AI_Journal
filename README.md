> This document serves as the complete design and technical documentation for the project.

# Design Goals

## TODO: Why this problem?
<!--
Describe why journaling consistency is hard, what users struggle with today,
and why existing tools fail to support reflection meaningfully.
-->

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

## 5. Goals (Weekly | Yearly)

**Contains**
- Weekly goals
- Yearly goals
- AI-generated encouragement and positive reinforcement

**Why this screen exists**
- Bullet journaling often combines reflection with intention-setting.
- Goals provide direction without pressure.


---

## Why Other Ideas Are Intentionally Excluded (For Now)

The following ideas were considered but intentionally deferred at this stage:

- Shared journals (couples, friends, families)  
- Statistical correlation dashboards  
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
// app/journal/page.tsx (Server Component)
import JournalEditor from "@/components/journal/JournalEditor";

export default function JournalPage() {
  // Server Component - can fetch data directly
  return <JournalEditor />; // Client Component for interactivity
}
```

## TODO: Why this tech stack?
<!--
Explain why Next.js, Tailwind, Firebase, and the chosen AI approach
were selected, including tradeoffs and alternatives considered.
-->

