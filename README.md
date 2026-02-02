# BuJo AI - AI-Augmented Bullet Journal

BuJo AI is an AI-augmented bullet journaling application that combines the structured, intentional nature of bullet journaling with empathetic AI-powered reflection. It helps users maintain consistent journaling habits while providing gentle, non-clinical insights.

# Getting Started

## Try the Web App

The app is deployed and available at: **[https://panw-ai-journal.vercel.app/login](https://panw-ai-journal.vercel.app/login)**

**Demo Video**: Watch a walkthrough of the app on [YouTube](https://youtu.be/tSCPBPdh9FE)

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

## Documentation

For complete design and technical documentation, see **[DOCUMENTATION.md](./DOCUMENTATION.md)**.

The documentation includes:
- Design goals and rationale
- Design system (typography, colors)
- Screen architecture and user flows
- Technical architecture and tech stack decisions
- Data model and API documentation
- Security and privacy considerations
- Deployment and performance metrics
