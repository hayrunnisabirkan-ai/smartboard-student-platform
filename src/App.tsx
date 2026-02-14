import { useState, useEffect } from 'react';
import { QuizProvider, useQuiz } from './context/QuizContext';
import { Dashboard } from './components/Dashboard';
import { TopicView } from './components/TopicView';
import { Quiz } from './components/Quiz';
import { Topic, QuizResult, UserProgress, Achievement } from './types';

type ViewState = 'dashboard' | 'topic' | 'quiz';

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    completedTopics: [],
    quizResults: [],
    totalScore: 0,
    achievements: [],
    streak: 0,
    lastActive: new Date()
  });
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    // Check streak on mount
    const today = new Date();
    const lastActive = localStorage.getItem('lastActive');
    if (lastActive) {
      const lastDate = new Date(lastActive);
      const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        const streak = parseInt(localStorage.getItem('streak') || '0');
        setUserProgress(prev => ({ ...prev, streak: streak + 1 }));
        localStorage.setItem('streak', String(streak + 1));
      } else if (diffDays > 1) {
        setUserProgress(prev => ({ ...prev, streak: 1 }));
        localStorage.setItem('streak', '1');
      } else {
        const streak = parseInt(localStorage.getItem('streak') || '0');
        setUserProgress(prev => ({ ...prev, streak }));
      }
    } else {
      setUserProgress(prev => ({ ...prev, streak: 1 }));
      localStorage.setItem('streak', '1');
    }
    localStorage.setItem('lastActive', today.toISOString());
  }, []);

  useEffect(() => {
    // Load progress from localStorage
    const savedProgress = localStorage.getItem('userProgress');
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    }
  }, []);

  useEffect(() => {
    // Save progress to localStorage
    localStorage.setItem('userProgress', JSON.stringify(userProgress));
  }, [userProgress]);

  const handleSelectTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setCurrentView('topic');
  };

  const handleStartQuiz = () => {
    setCurrentView('quiz');
  };

  const handleQuizComplete = (result: QuizResult) => {
    setUserProgress(prev => ({
      ...prev,
      completedTopics: selectedTopic && !prev.completedTopics.includes(selectedTopic.id)
        ? [...prev.completedTopics, selectedTopic.id]
        : prev.completedTopics,
      quizResults: [...prev.quizResults, result],
      totalScore: prev.totalScore + result.score
    }));

    // Check for achievements
    checkAchievements(result);
  };

  const checkAchievements = (result: QuizResult) => {
    const achievements: Achievement[] = [];

    if (result.score >= 90) {
      achievements.push({
        id: 'excellent',
        title: 'Mükemmel!',
        description: 'İlk 90+ puanını aldın!',
        icon: '🏆',
        unlockedAt: new Date()
      });
    }

    if (result.score >= 80 && userProgress.streak >= 3) {
      achievements.push({
        id: 'dedicated',
        title: 'Çalışkan!',
        description: '3 gün üst üste çalışıp iyi puan aldın!',
        icon: '⭐',
        unlockedAt: new Date()
      });
    }

    if (userProgress.totalScore + result.score >= 500) {
      achievements.push({
        id: 'score_500',
        title: 'Puan Ustası!',
        description: '500 puan barajını aştın!',
        icon: '🎯',
        unlockedAt: new Date()
      });
    }

    if (result.totalQuestions >= 10 && result.correctAnswers === result.totalQuestions) {
      achievements.push({
        id: 'perfect_10',
        title: 'Süper Adam!',
        description: '10 soruda tam puan!',
        icon: '⚡',
        unlockedAt: new Date()
      });
    }

    achievements.forEach(achievement => {
      if (!userProgress.achievements.find(a => a.id === achievement.id)) {
        setUserProgress(prev => ({
          ...prev,
          achievements: [...prev.achievements, achievement]
        }));
        setShowAchievement(achievement);
        setTimeout(() => setShowAchievement(null), 4000);
      }
    });
  };

  const handleBack = () => {
    if (currentView === 'topic') {
      setCurrentView('dashboard');
      setSelectedTopic(null);
    } else if (currentView === 'quiz') {
      setCurrentView('topic');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Achievement Notification */}
      {showAchievement && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-xl shadow-lg flex items-center gap-3">
            <span className="text-3xl">{showAchievement.icon}</span>
            <div>
              <h4 className="font-bold">{showAchievement.title}</h4>
              <p className="text-sm">{showAchievement.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {currentView === 'dashboard' && (
        <Dashboard
          onSelectTopic={handleSelectTopic}
          onStartQuiz={(topic) => {
            setSelectedTopic(topic);
            setCurrentView('quiz');
          }}
          userProgress={userProgress}
        />
      )}

      {currentView === 'topic' && selectedTopic && (
        <TopicView
          topic={selectedTopic}
          onBack={() => {
            setCurrentView('dashboard');
            setSelectedTopic(null);
          }}
          onStartQuiz={() => setCurrentView('quiz')}
        />
      )}

      {currentView === 'quiz' && selectedTopic && (
        <Quiz
          topic={selectedTopic}
          onComplete={handleQuizComplete}
          onBack={() => setCurrentView('topic')}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <QuizProvider>
      <AppContent />
    </QuizProvider>
  );
}

export default App;
