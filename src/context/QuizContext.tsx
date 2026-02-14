import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Topic, QuizResult, UserProgress, Achievement, Unit } from '../types';

interface QuizContextType {
  currentTopic: Topic | null;
  setCurrentTopic: (topic: Topic | null) => void;
  quizResults: QuizResult[];
  addQuizResult: (result: QuizResult) => void;
  userProgress: UserProgress;
  updateProgress: (topicId: string, score: number) => void;
  units: Unit[];
  setUnits: (units: Unit[]) => void;
  unlockedAchievements: Achievement[];
  unlockAchievement: (achievement: Achievement) => void;
  streak: number;
  updateStreak: () => void;
}

const defaultProgress: UserProgress = {
  completedTopics: [],
  quizResults: [],
  totalScore: 0,
  achievements: [],
  streak: 0,
  lastActive: new Date()
};

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress>(defaultProgress);
  const [units, setUnits] = useState<Unit[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [streak, setStreak] = useState(0);

  const addQuizResult = useCallback((result: QuizResult) => {
    setQuizResults(prev => [...prev, result]);
    setUserProgress(prev => ({
      ...prev,
      totalScore: prev.totalScore + result.score,
      quizResults: [...prev.quizResults, result]
    }));
  }, []);

  const updateProgress = useCallback((topicId: string, score: number) => {
    setUserProgress(prev => {
      if (prev.completedTopics.includes(topicId)) {
        return prev;
      }
      return {
        ...prev,
        completedTopics: [...prev.completedTopics, topicId],
        totalScore: prev.totalScore + score,
        lastActive: new Date()
      };
    });

    // Check for achievements
    checkAchievements(score);
  }, []);

  const checkAchievements = (score: number) => {
    const newAchievements: Achievement[] = [];

    if (score >= 90) {
      newAchievements.push({
        id: 'excellent',
        title: 'Mükemmel!',
        description: 'İlk mükemmel puanını aldın!',
        icon: '🏆'
      });
    }

    if (streak >= 3) {
      newAchievements.push({
        id: 'streak_3',
        title: 'Üst Üste!',
        description: '3 gün üst üste çalıştın!',
        icon: '🔥'
      });
    }

    if (score >= 70 && streak >= 5) {
      newAchievements.push({
        id: 'dedicated',
        title: 'Çalışkan!',
        description: '5 gün üst üste ve iyi puan!',
        icon: '⭐'
      });
    }

    newAchievements.forEach(achievement => {
      if (!unlockedAchievements.find(a => a.id === achievement.id)) {
        unlockAchievement({ ...achievement, unlockedAt: new Date() });
      }
    });
  };

  const unlockAchievement = useCallback((achievement: Achievement) => {
    setUnlockedAchievements(prev => [...prev, achievement]);
  }, []);

  const updateStreak = useCallback(() => {
    const today = new Date();
    const lastActive = new Date(userProgress.lastActive);
    const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      setStreak(prev => prev + 1);
    } else if (diffDays === 0) {
      // Same day, no change
    } else {
      setStreak(1);
    }
  }, [userProgress.lastActive]);

  return (
    <QuizContext.Provider
      value={{
        currentTopic,
        setCurrentTopic,
        quizResults,
        addQuizResult,
        userProgress,
        updateProgress,
        units,
        setUnits,
        unlockedAchievements,
        unlockAchievement,
        streak,
        updateStreak
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}
