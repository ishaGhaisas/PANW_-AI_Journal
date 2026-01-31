// AI reflection types

export type ReflectionResponse = {
  reflection: string;
  mood: string;
  followUpQuestion: string;
};

export type ReflectionRequest = {
  text: string;
};
