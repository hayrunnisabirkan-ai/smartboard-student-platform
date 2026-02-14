import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Topic, Infographic } from '../types';
import { generateInfographic } from '../services/geminiService';

interface TopicViewProps {
  topic: Topic;
  onBack: () => void;
  onStartQuiz: () => void;
}

export function TopicView({ topic, onBack, onStartQuiz }: TopicViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'concepts' | 'examples' | 'infographic'>('overview');
  const [infographic, setInfographic] = useState<Infographic | null>(null);
  const [loadingInfographic, setLoadingInfographic] = useState(false);

  const loadInfographic = async () => {
    if (infographic) return;
    setLoadingInfographic(true);
    try {
      const result = await generateInfographic(topic);
      setInfographic(result);
    } catch (error) {
      console.error('Error generating infographic:', error);
    } finally {
      setLoadingInfographic(false);
    }
  };

  const safeSvg = infographic?.vectorSvg ? sanitizeSvg(infographic.vectorSvg) : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Geri Dön
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">{topic.title}</h1>
              <p className="text-sm text-gray-500">{topic.description}</p>
            </div>
            <Button variant="primary" size="lg" onClick={onStartQuiz}>
              Teste Başla →
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-6 border-b border-gray-100 pb-1">
            {[
              { id: 'overview', label: 'Ne Öğrendim?', icon: '📝' },
              { id: 'concepts', label: 'Kavram Kartları', icon: '💡' },
              { id: 'examples', label: 'Örnekler', icon: '📊' },
              { id: 'infographic', label: 'İnfografik', icon: '🎨' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as typeof activeTab);
                  if (tab.id === 'infographic') loadInfographic();
                }}
                className={`
                  flex items-center gap-2 px-4 py-3 font-medium rounded-t-lg transition-colors
                  ${activeTab === tab.id
                    ? 'text-[#2B5D3A] border-b-2 border-[#2B5D3A] bg-[#2B5D3A]/5'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
                `}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Summary */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader
                  title="Konu Özeti"
                  icon={<span className="text-xl">📖</span>}
                />
                <CardContent>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-600 leading-relaxed text-lg">
                      {topic.summary}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Key Learnings */}
              <Card>
                <CardHeader
                  title="Öğreneceklerimiz"
                  icon={<span className="text-xl">🎯</span>}
                />
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {topic.keyConcepts.map((concept, index) => (
                      <div
                        key={concept.id}
                        className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">{concept.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{concept.content}</p>
                            <span className={`
                              inline-block mt-2 text-xs px-2 py-1 rounded-full
                              ${concept.importance === 'high'
                                ? 'bg-red-100 text-red-700'
                                : concept.importance === 'medium'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'}
                            `}>
                              {concept.importance === 'high' ? 'Çok Önemli' : concept.importance === 'medium' ? 'Önemli' : 'Temel'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Common Mistakes */}
              <Card>
                <CardHeader
                  title="Dikkat! Yanlış Bilinenler"
                  icon={<span className="text-xl">⚠️</span>}
                />
                <CardContent className="space-y-4">
                  {topic.misconceptions.map((misconception) => (
                    <div
                      key={misconception.id}
                      className="p-4 bg-red-50 rounded-xl border border-red-200"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-red-500 text-xl">✗</span>
                        <div>
                          <h4 className="font-medium text-red-800">{misconception.wrongBelief}</h4>
                          <p className="text-sm text-gray-600 mt-2">
                            <span className="font-medium text-green-700">Doğrusu:</span> {misconception.correctExplanation}
                          </p>
                          <div className="mt-3 p-2 bg-white/50 rounded-lg text-sm text-gray-600">
                            💡 {misconception.example}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Tips */}
              <Card>
                <CardHeader
                  title="Pratik İpuçları"
                  icon={<span className="text-xl">💪</span>}
                />
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-gray-600">
                      <span className="text-green-500">✓</span>
                      Konuyu günlük hayatla ilişkilendirin
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <span className="text-green-500">✓</span>
                      Bol bol pratik yapın
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <span className="text-green-500">✓</span>
                      Hatalarınızdan öğrenin
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <span className="text-green-500">✓</span>
                      Düzenli tekrar yapın
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'concepts' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topic.keyConcepts.map((concept, index) => (
                <Card key={concept.id} hover className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`
                        w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg
                        ${concept.importance === 'high'
                          ? 'bg-gradient-to-br from-red-500 to-red-600'
                          : concept.importance === 'medium'
                          ? 'bg-gradient-to-br from-yellow-500 to-yellow-600'
                          : 'bg-gradient-to-br from-green-500 to-green-600'}
                      `}>
                        {index + 1}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">{concept.title}</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{concept.content}</p>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <span className={`
                        inline-block text-xs font-medium px-3 py-1 rounded-full
                        ${concept.importance === 'high'
                          ? 'bg-red-100 text-red-700'
                          : concept.importance === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'}
                      `}>
                        {concept.importance === 'high' ? 'Çok Önemli' : concept.importance === 'medium' ? 'Önemli' : 'Temel Kavram'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Misconceptions Section */}
            <Card className="mt-8">
              <CardHeader
                title="Kavram Yanılgıları"
                subtitle="Öğrencilerin sık düştüğü hatalar ve doğru açıklamaları"
                icon={<span className="text-xl">🎯</span>}
              />
              <CardContent>
                <div className="space-y-4">
                  {topic.misconceptions.map((misconception, index) => (
                    <div
                      key={misconception.id}
                      className="p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-red-600 font-medium">Yanlış:</span>
                            <span className="text-gray-800">{misconception.wrongBelief}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-green-600 font-medium">Doğru:</span>
                            <span className="text-gray-800">{misconception.correctExplanation}</span>
                          </div>
                          <div className="mt-3 p-3 bg-white/70 rounded-lg">
                            <span className="text-sm text-gray-500">Örnek: </span>
                            <span className="text-gray-700">{misconception.example}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'examples' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Konu Pekiştirme Örnekleri</h2>
              <p className="text-gray-500 mt-2">Aşağıdaki örnekleri inceleyerek konuyu daha iyi anlayabilirsiniz</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {topic.examples.map((example, index) => (
                <Card key={example.id} className="overflow-hidden">
                  <div className={`
                    px-6 py-3 text-white font-semibold
                    ${example.isCorrect
                      ? 'bg-gradient-to-r from-green-500 to-green-600'
                      : 'bg-gradient-to-r from-red-500 to-red-600'}
                  `}>
                    <div className="flex items-center gap-2">
                      <span>{example.isCorrect ? '✅ Doğru Örnek' : '❌ Yanlış Örnek'}</span>
                      <span className="text-sm font-normal opacity-90">Örnek {index + 1}</span>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Soru:</h4>
                      <p className="text-gray-800 font-medium">{example.problem}</p>
                    </div>
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Çözüm:</h4>
                      <div className="p-4 bg-gray-50 rounded-lg font-mono text-sm text-gray-700 whitespace-pre-wrap">
                        {example.solution}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Açıklama:</h4>
                      <p className="text-gray-600">{example.explanation}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Practice Section */}
            <Card>
              <CardHeader
                title="Kendi Çözümünü Yap"
                icon={<span className="text-xl">✏️</span>}
              />
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold text-gray-800">Hazır Mısın?</h3>
                  <p className="text-gray-500 mt-2">Şimdi kendini test etme zamanı!</p>
                  <Button variant="primary" size="lg" className="mt-6" onClick={onStartQuiz}>
                    Teste Başla
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'infographic' && (
          <div className="space-y-6">
            {loadingInfographic ? (
              <div className="text-center py-20">
                <div className="animate-spin w-12 h-12 border-4 border-[#2B5D3A] border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-500">İnfografik oluşturuluyor...</p>
              </div>
            ) : infographic ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="lg:col-span-2">
                  <CardHeader
                    title={infographic.title}
                    icon={<span className="text-xl">🎨</span>}
                  />
                  <CardContent>
                    <div className="bg-gradient-to-br from-[#2B5D3A]/5 to-[#4A90E2]/5 rounded-xl p-6">
                      {safeSvg ? (
                        <div
                          className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm"
                          dangerouslySetInnerHTML={{ __html: safeSvg }}
                        />
                      ) : (
                        <div className="bg-white rounded-xl p-5 border border-gray-100 text-gray-600">
                          Vektörel infografik üretilemedi. Metin özeti gösteriliyor.
                        </div>
                      )}
                      <div className="mt-5 p-4 bg-white/80 rounded-xl border border-gray-100">
                        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                          {infographic.content}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Points */}
                <Card>
                  <CardHeader
                    title="Anahtar Formüller"
                    icon={<span className="text-xl">📐</span>}
                  />
                  <CardContent>
                    <div className="space-y-4">
                      {(infographic.keyPoints?.length ? infographic.keyPoints : topic.keyConcepts.slice(0, 4).map(c => c.title)).map((point, index) => (
                        <div key={`${point}-${index}`} className="p-4 bg-blue-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#2B5D3A] text-white rounded-lg flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">{point}</h4>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Study Tips */}
                <Card>
                  <CardHeader
                    title="Çalışma Stratejileri"
                    icon={<span className="text-xl">💡</span>}
                  />
                  <CardContent>
                    <div className="space-y-3">
                      {(infographic.steps?.length ? infographic.steps : [
                        'Konuyu günlük hayatla ilişkilendir',
                        'Bol bol pratik soru çöz',
                        'Hatalarını analiz et ve tekrar et',
                        'Düzenli tekrar yaparak pekiştir',
                        'Arkadaşlarınla birlikte çalış'
                      ]).map((tip, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          <span className="text-gray-700">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-500">İnfografik yüklenemedi</p>
              </div>
            )}

            <div className="text-center">
              <Button variant="primary" size="lg" onClick={onStartQuiz}>
                Öğrendiklerini Test Et 🚀
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function sanitizeSvg(svg: string): string {
  const lowered = svg.toLowerCase();
  if (!lowered.includes('<svg')) return '';
  if (lowered.includes('<script') || lowered.includes('onload=') || lowered.includes('onclick=')) return '';
  if (lowered.includes('<iframe') || lowered.includes('<foreignobject')) return '';
  return svg;
}
