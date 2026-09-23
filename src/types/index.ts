/**
 * AstroStudy Data Models & Types
 */

export type SyllabusStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface SyllabusItem {
  id: string;
  week: number | string;
  topic: string;
  readings: string;
  assignmentDue: string;
  status: SyllabusStatus;
  notes?: string;
  keyPoints?: string[];
}

export interface SyllabusConfig {
  sheetUrlOrId: string;
  courseName: string;
  courseCode: string;
  term: string;
  lastSyncedAt: string | null;
  syncSource: 'google_sheet' | 'template' | 'custom';
}

export type FlashcardMastery = 'unreviewed' | 'struggling' | 'review_later' | 'mastered';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  topic: string;
  status: FlashcardMastery;
  reviewCount: number;
  lastReviewedAt?: string;
  tags?: string[];
}

export interface QuizQuestion {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  whyWrong?: string;
}

export interface QuizSubmission {
  id: string;
  topic: string;
  date: string;
  score: number;
  total: number;
  percentage: number;
  answers: {
    questionId: string;
    selectedIndex: number;
    isCorrect: boolean;
  }[];
}

export type PomodoroMode = 'study' | 'short_break' | 'long_break';

export interface PomodoroSettings {
  studyDuration: number; // minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number; // sessions before long break
  soundEnabled: boolean;
  autoStartBreaks: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  xpReward: number;
  unlockedAt: string | null;
  progress: number;
  maxProgress: number;
}

export interface GamificationState {
  currentStreak: number;
  bestStreak: number;
  lastStudiedDate: string | null; // YYYY-MM-DD
  activityDates: string[]; // list of unique YYYY-MM-DD strings
  totalXP: number;
  level: number;
  levelTitle: string;
  xpToNextLevel: number;
  achievements: Achievement[];
  totalPomodorosCompleted: number;
  totalCardsMastered: number;
  totalQuizzesPassed: number;
  todayFocusMinutes: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  topicRef?: string;
  suggestedAction?: {
    type: 'create_flashcards' | 'start_quiz' | 'pomodoro_focus';
    data?: any;
    label: string;
  };
  generatedCards?: Array<{ front: string; back: string }>;
}
