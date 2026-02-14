import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Timer } from './ui/Timer';
import { ProgressBar } from './ui/ProgressBar';
import { Topic, Question, QuizResult, Option } from '../types';

interface QuizProps {
  topic: Topic;
  onComplete: (result: QuizResult) => void;
  onBack: () => void;
}

export function Quiz({ topic, onComplete, onBack }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  const currentQuestion = topic.questions[currentQuestionIndex];
  const totalQuestions = topic.questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleTimeUp = useCallback(() => {
    if (!showExplanation) {
      setShowExplanation(true);
      setWrongAnswers(prev => prev + 1);
    }
  }, [showExplanation]);

  const handleAnswerSelect = (optionId: string) => {
    if (showExplanation) return;
    setSelectedAnswer(optionId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || showExplanation) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    setShowExplanation(true);

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    } else {
      setWrongAnswers(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setTimeSpent(prev => prev + currentQuestion.timeLimit);
    } else {
      setTimeSpent(prev => prev + currentQuestion.timeLimit);
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const finalResult: QuizResult = {
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      score: Math.round((correctAnswers / totalQuestions) * 100),
      grade: getGrade(Math.round((correctAnswers / totalQuestions) * 100)),
      timeSpent,
      topicPerformance: {
        [topic.title]: Math.round((correctAnswers / totalQuestions) * 100)
      }
    };
    setResult(finalResult);
    setQuizCompleted(true);
    onComplete(finalResult);
  };

  const getGrade = (score: number): 'excellent' | 'good' | 'average' | 'weak' => {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'average';
    return 'weak';
  };

  const getGradeLabel = (grade: string) => {
    const labels: Record<string, { text: string; color: string; emoji: string }> = {
      excellent: { text: 'Çok İyi', color: '#22c55e', emoji: '🏆' },
      good: { text: 'İyi', color: '#3b82f6', emoji: '⭐' },
      average: { text: 'Orta', color: '#f59e0b', emoji: '👍' },
      weak: { text: 'Zayıf', color: '#ef4444', emoji: '💪' }
    };
    return labels[grade] || labels.weak;
  };

  if (quizCompleted && result) {
    const grade = getGradeLabel(result.grade);

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <header className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Geri Dön
              </Button>
              <h1 className="text-xl font-bold text-gray-800">Test Sonucu</h1>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-8">
          {/* Result Card */}
          <Card className="mb-8 overflow-hidden">
            <div
              className="px-8 py-6 text-white"
              style={{ background: `linear-gradient(135deg, ${grade.color}, ${grade.color}dd)` }}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">{grade.emoji}</div>
                <h2 className="text-3xl font-bold mb-2">{grade.text}</h2>
                <p className="text-white/80">Test tamamlandı!</p>
              </div>
            </div>
            <CardContent className="p-8">
              {/* Score */}
              <div className="text-center mb-8">
                <div className="text-6xl font-bold text-gray-800 mb-2">{result.score}</div>
                <div className="text-gray-500">Toplam Puan</div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-3xl font-bold text-green-600">{result.correctAnswers}</div>
                  <div className="text-sm text-gray-500 mt-1">Doğru</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-xl">
                  <div className="text-3xl font-bold text-red-600">{result.wrongAnswers}</div>
                  <div className="text-sm text-gray-500 mt-1">Yanlış</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-3xl font-bold text-blue-600">{result.totalQuestions}</div>
                  <div className="text-sm text-gray-500 mt-1">Toplam Soru</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="text-3xl font-bold text-purple-600">
                    {Math.floor(result.timeSpent / 60)}:{String(result.timeSpent % 60).padStart(2, '0')}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Süre</div>
                </div>
              </div>

              {/* Progress Circle */}
              <div className="flex justify-center mb-8">
                <div className="text-center">
                  <div
                    className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg"
                    style={{ background: `conic-gradient(${grade.color} ${result.score}%, #e5e7eb 0)` }}
                  >
                    {result.score}%
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Başarı Oranı</p>
                </div>
              </div>

              {/* Grade Description */}
              <div className="p-6 bg-gray-50 rounded-xl mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Değerlendirme:</h3>
                {result.score >= 90 && (
                  <p className="text-gray-600">
                    Çok iyi seviyedesin. Konuyu güçlü şekilde kavradın ve zamana karşı sorularda yüksek doğruluk sağladın.
                  </p>
                )}
                {result.score >= 70 && result.score < 90 && (
                  <p className="text-gray-600">
                    İyi seviyedesin. Konunun büyük kısmını anladın; zor ve yeni nesil sorularda hız-pratikle puanını artırabilirsin.
                  </p>
                )}
                {result.score >= 50 && result.score < 70 && (
                  <p className="text-gray-600">
                    Orta seviyedesin. Temel kavramlar var, ancak kavram yanılgıları ve işlem adımlarını tekrar etmen gerekiyor.
                  </p>
                )}
                {result.score < 50 && (
                  <p className="text-gray-600">
                    Zayıf seviyedesin. "Ne Öğrendim?" özetini ve örnek çözümleri tekrar edip ardından yeniden deneme yapmalısın.
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={onBack}>
                  Konuya Dön
                </Button>
                <Button variant="primary" onClick={() => {
                  setCurrentQuestionIndex(0);
                  setSelectedAnswer(null);
                  setShowExplanation(false);
                  setCorrectAnswers(0);
                  setWrongAnswers(0);
                  setTimeSpent(0);
                  setQuizCompleted(false);
                  setResult(null);
                }}>
                  Tekrar Çöz
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Geri
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">{topic.title}</h1>
                <p className="text-sm text-gray-500">Test Çözümü</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Timer */}
              {!showExplanation && (
                <Timer
                  duration={currentQuestion.timeLimit}
                  onTimeUp={handleTimeUp}
                />
              )}

              {/* Question Counter */}
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl">
                <span className="text-lg font-bold text-gray-800">
                  {currentQuestionIndex + 1}
                </span>
                <span className="text-gray-500">/ {totalQuestions}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <ProgressBar value={progress} color="#2B5D3A" size="md" />
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>Başlangıç</span>
              <span>Tamamlanma: {Math.round(progress)}%</span>
              <span>Bitiş</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Question Card */}
        <Card className="mb-6">
          <CardContent className="p-8">
            {/* Question Number and Difficulty */}
            <div className="flex items-center justify-between mb-6">
              <span className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${currentQuestion.difficulty === 'easy'
                  ? 'bg-green-100 text-green-700'
                  : currentQuestion.difficulty === 'medium'
                  ? 'bg-yellow-100 text-yellow-700'
                  : currentQuestion.difficulty === 'hard'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-purple-100 text-purple-700'}
              `}>
                {currentQuestion.difficulty === 'easy' ? 'Kolay' :
                 currentQuestion.difficulty === 'medium' ? 'Orta' :
                 currentQuestion.difficulty === 'hard' ? 'Zor' : 'Yeni Nesil'}
              </span>
              <span className="text-sm text-gray-500">
                Soru {currentQuestionIndex + 1} / {totalQuestions}
              </span>
            </div>

            {/* Question Text */}
            <h2 className="text-xl font-medium text-gray-800 mb-8 leading-relaxed">
              {currentQuestion.text}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const optionLetter = String.fromCharCode(65 + index);
                const isSelected = selectedAnswer === option.id;
                const isCorrect = option.id === currentQuestion.correctAnswer;
                const showResult = showExplanation;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleAnswerSelect(option.id)}
                    disabled={showExplanation}
                    className={`
                      w-full p-4 rounded-xl text-left transition-all duration-200
                      flex items-center gap-4
                      ${showResult
                        ? isCorrect
                          ? 'bg-green-100 border-2 border-green-500'
                          : isSelected
                            ? 'bg-red-100 border-2 border-red-500'
                            : 'bg-gray-50 border-2 border-gray-200'
                        : isSelected
                          ? 'bg-[#2B5D3A]/10 border-2 border-[#2B5D3A]'
                          : 'bg-white border-2 border-gray-200 hover:border-[#2B5D3A]/50 hover:bg-gray-50'
                      }
                      ${showExplanation ? 'cursor-default' : 'cursor-pointer'}
                    `}
                  >
                    <span className={`
                      w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shrink-0
                      ${showResult
                        ? isCorrect
                          ? 'bg-green-500 text-white'
                          : isSelected
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                        : isSelected
                          ? 'bg-[#2B5D3A] text-white'
                          : 'bg-gray-100 text-gray-600'
                      }
                    `}>
                      {optionLetter}
                    </span>
                    <span className="flex-1 text-gray-700 font-medium">
                      {option.text}
                    </span>
                    {showResult && (
                      <span className="text-2xl">
                        {isCorrect ? '✅' : isSelected ? '❌' : ''}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {showExplanation && (
              <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-800 mb-2">Çözüm Açıklaması</h4>
                    <p className="text-blue-700 leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end">
          {!showExplanation ? (
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer}
            >
              Cevabı Kontrol Et
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={handleNextQuestion}
            >
              {currentQuestionIndex < totalQuestions - 1 ? 'Sonraki Soru →' : 'Testi Bitir'}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
