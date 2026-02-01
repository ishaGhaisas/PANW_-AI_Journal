// AI reflection types

export type ReflectionResponse = {
  reflection: string;
  mood: string;
  followUpQuestion: string;
  goalMention?: string; // Optional mention if user's entry relates to their goals
};

export type ReflectionRequest = {
  text: string;
  goals?: Array<{ type: string; text: string }>; // User's active goals
};

export type WeeklyReflectionResponse = {
  themes: string; // Narrative themes noticed across entries
  moodPatterns: string; // Narrative description of mood patterns
  encouragement: string; // Gentle encouragement message
  goalProgress?: string; // Optional mention of goal progress if relevant
};

export type WeeklyReflectionRequest = {
  userId: string;
};
