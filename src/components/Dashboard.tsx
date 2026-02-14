import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { CircularProgress } from './ui/ProgressBar';
import { Unit, Topic, UserProgress } from '../types';
import { generateTopicContent } from '../services/geminiService';
import { curriculumSources, getInitialCurriculumUnits } from '../data/curriculum';

interface DashboardProps {
  onSelectTopic: (topic: Topic) => void;
  onStartQuiz: (topic: Topic) => void;
  userProgress: UserProgress;
}

export function Dashboard({ onSelectTopic, onStartQuiz, userProgress }: DashboardProps) {
  const [units, setUnits] = useState<Unit[]>(getInitialCurriculumUnits);

  const [loadingTopics, setLoadingTopics] = useState<Set<string>>(new Set());

  const loadTopicContent = async (unit: Unit, topic: Topic) => {
    if (loadingTopics.has(topic.id)) return;

    setLoadingTopics(prev => new Set(prev).add(topic.id));
    try {
      const content = await generateTopicContent(unit.title, topic.title);
      setUnits(prev => prev.map(u => {
        if (u.id === unit.id) {
          return {
            ...u,
            topics: u.topics.map(t =>
              t.id === topic.id
                ? { ...t, ...content, id: t.id, title: t.title }
                : t
            )
          };
        }
        return u;
      }));
    } catch (error) {
      console.error('Error loading topic:', error);
    } finally {
      setLoadingTopics(prev => {
        const next = new Set(prev);
        next.delete(topic.id);
        return next;
      });
    }
  };

  const overallProgress = userProgress.completedTopics.length > 0
    ? (userProgress.completedTopics.length / units.flatMap(u => u.topics).length) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#2B5D3A] rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Matematik Öğrenme Platformu</h1>
                <p className="text-sm text-gray-500">Etkili ve eğlenceli matematik öğrenimi</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Streak */}
              <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-xl">
                <span className="text-2xl">🔥</span>
                <span className="font-bold text-orange-600">{userProgress.streak || 0} gün</span>
              </div>

              {/* Score */}
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-xl">
                <span className="text-2xl">⭐</span>
                <span className="font-bold text-green-600">{userProgress.totalScore} puan</span>
              </div>

              {/* Progress */}
              <CircularProgress value={overallProgress} size={60} strokeWidth={5} />
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Kaynaklar: <a className="underline" href={curriculumSources.mebProgram} target="_blank" rel="noreferrer">TYMM MEB</a>{' '}
            ve <a className="underline" href={curriculumSources.grade8} target="_blank" rel="noreferrer">MEB ODM konu dağılım tabloları</a>
            {' '}({curriculumSources.fetchedAt})
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                📚
              </div>
              <div>
                <p className="text-sm text-gray-500">Tamamlanan Konular</p>
                <p className="text-2xl font-bold text-gray-800">
                  {userProgress.completedTopics.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                ✓
              </div>
              <div>
                <p className="text-sm text-gray-500">Çözülen Testler</p>
                <p className="text-2xl font-bold text-gray-800">
                  {userProgress.quizResults.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
                🏆
              </div>
              <div>
                <p className="text-sm text-gray-500">Başarımlar</p>
                <p className="text-2xl font-bold text-gray-800">
                  {userProgress.achievements.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">
                📈
              </div>
              <div>
                <p className="text-sm text-gray-500">Ortalama Puan</p>
                <p className="text-2xl font-bold text-gray-800">
                  {userProgress.quizResults.length > 0
                    ? Math.round(userProgress.quizResults.reduce((acc, r) => acc + r.score, 0) / userProgress.quizResults.length)
                    : 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Units and Topics */}
        <div className="space-y-8">
          {units.map((unit) => (
            <Card key={unit.id} className="overflow-hidden">
              <CardHeader
                title={unit.title}
                subtitle={unit.description}
                icon={<span className="text-2xl">📖</span>}
              />
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {unit.topics.map((topic) => {
                    const isCompleted = userProgress.completedTopics.includes(topic.id);
                    const isLoading = loadingTopics.has(topic.id);

                    return (
                      <div
                        key={topic.id}
                        className="p-6 hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div
                              className={`
                                w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm
                                ${isCompleted
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-100 text-gray-600 group-hover:bg-[#2B5D3A] group-hover:text-white transition-colors'}
                              `}
                            >
                              {isCompleted ? '✓' : topic.keyConcepts.length || '?'}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 group-hover:text-[#2B5D3A] transition-colors">
                                {topic.title}
                              </h3>
                              <p className="text-sm text-gray-500 mt-0.5">
                                {topic.description}
                              </p>
                              {topic.keyConcepts.length > 0 && (
                                <div className="flex gap-2 mt-2">
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                    {topic.keyConcepts.length} Kavram
                                  </span>
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                    {topic.questions.length} Soru
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {isLoading ? (
                              <div className="flex items-center gap-2 text-gray-500">
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span className="text-sm">Yükleniyor...</span>
                              </div>
                            ) : (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    loadTopicContent(unit, topic);
                                  }}
                                >
                                  Öğren
                                </Button>
                                {topic.keyConcepts.length > 0 && (
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => onSelectTopic(topic)}
                                  >
                                    Test Çöz
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Achievements Section */}
        {userProgress.achievements.length > 0 && (
          <Card className="mt-8">
            <CardHeader
              title="Başarımlarım"
              subtitle="Kazandığınız rozetler"
              icon={<span className="text-2xl">🏆</span>}
            />
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {userProgress.achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl text-center border border-yellow-200"
                  >
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <h4 className="font-semibold text-gray-800">{achievement.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
