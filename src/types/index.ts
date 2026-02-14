export interface Topic {
  id: string;
  title: string;
  description: string;
  summary: string;
  imageUrl?: string;
  keyConcepts: KeyConcept[];
  misconceptions: Misconception[];
  examples: Example[];
  questions: Question[];
}

export interface KeyConcept {
  id: string;
  title: string;
  content: string;
  importance: 'high' | 'medium' | 'low';
}

export interface Misconception {
  id: string;
  wrongBelief: string;
  correctExplanation: string;
  example: string;
}

export interface Example {
  id: string;
  problem: string;
  solution: string;
  isCorrect: boolean;
  explanation: string;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'new_generation';
  timeLimit: number;
}

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  grade: 'excellent' | 'good' | 'average' | 'weak';
  timeSpent: number;
  topicPerformance: Record<string, number>;
}

export interface UserProgress {
  completedTopics: string[];
  quizResults: QuizResult[];
  totalScore: number;
  achievements: Achievement[];
  streak: number;
  lastActive: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  topics: Topic[];
  grade: number;
}

export interface Infographic {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  vectorSvg?: string;
  keyPoints?: string[];
  steps?: string[];
  createdAt: Date;
}
