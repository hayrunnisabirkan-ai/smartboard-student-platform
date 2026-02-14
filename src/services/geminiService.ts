import { Topic, Question, Infographic } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-3-flash-preview';

function getApiUrl() {
  return `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;
}

async function requestGemini(prompt: string) {
  if (!API_KEY) {
    throw new Error('VITE_GEMINI_API_KEY tanımlı değil');
  }

  const response = await fetch(getApiUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }]
    }),
  });

  if (!response.ok) {
    throw new Error('API isteği başarısız oldu');
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text as string;
}

export async function generateTopicContent(unitTitle: string, topicTitle: string): Promise<Topic> {
  const prompt = `
    Sen deneyimli bir matematik öğretmenisin. ${unitTitle} konusunda ${topicTitle} konusu için kapsamlı bir ders içeriği oluştur.

    Aşağıdaki formatta JSON çıktı ver:

    {
      "id": "unique_id",
      "title": "${topicTitle}",
      "description": "Konunun kısa açıklaması",
      "summary": "Bu konuda öğrenileceklerin özeti (2-3 paragraf)",
      "keyConcepts": [
        {
          "id": "kc1",
          "title": "Kavram 1",
          "content": "Kavramın detaylı açıklaması",
          "importance": "high"
        }
      ],
      "misconceptions": [
        {
          "id": "m1",
          "wrongBelief": "Öğrencilerin sık yaptığı hatalı düşünce",
          "correctExplanation": "Doğru açıklama",
          "example": "Bu yanılgıya örnek"
        }
      ],
      "examples": [
        {
          "id": "e1",
          "problem": "Örnek soru",
          "solution": "Çözüm adımları",
          "isCorrect": true,
          "explanation": "Çözümün açıklaması"
        }
      ],
      "questions": [
        {
          "id": "q1",
          "text": "Soru metni",
          "options": [
            {"id": "a", "text": "A şıkkı", "isCorrect": false},
            {"id": "b", "text": "B şıkkı", "isCorrect": true},
            {"id": "c", "text": "C şıkkı", "isCorrect": false},
            {"id": "d", "text": "D şıkkı", "isCorrect": false}
          ],
          "correctAnswer": "b",
          "explanation": "Sorunun detaylı çözümü",
          "difficulty": "medium",
          "timeLimit": 30
        }
      ]
    }

    Önemli notlar:
    - En az 5 adet kavram kartı ekle
    - En az 5 adet kavram yanılgısı ekle
    - En az 10 adet örnek soru ekle
    - En az 7 adet test sorusu ekle (orta, zor ve yeni nesil sorular ağırlıklı)
    - En az 3 adet yeni nesil soru ekle
    - Süreleri zorluk seviyesine göre ayarla: orta 30 sn, zor 45 sn, yeni nesil 60 sn
    - Her sorunun çözümünü adım adım ve detaylı yaz
    - Türkçe olarak yaz
  `;

  try {
    const content = await requestGemini(prompt);

    // JSON parse etme
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonContent = jsonMatch[1] || jsonMatch[0];
      return JSON.parse(jsonContent);
    }

    throw new Error('Geçerli JSON bulunamadı');
  } catch (error) {
    console.error('Gemini API Error:', error);
    // Fallback content
    return generateFallbackTopic(unitTitle, topicTitle);
  }
}

export async function generateQuestions(topic: Topic, difficulty: 'easy' | 'medium' | 'hard' | 'new_generation', count: number = 5): Promise<Question[]> {
  const prompt = `
    ${topic.title} konusu için ${difficulty} seviyesinde ${count} adet test sorusu oluştur.

    Mevcut konu içeriği:
    - Konu başlığı: ${topic.title}
    - Önemli kavramlar: ${topic.keyConcepts.map(k => k.title).join(', ')}
    - Örnek sorular: ${topic.examples.map(e => e.problem).join('; ')}

    Aşağıdaki formatta JSON çıktı ver:

    {
      "questions": [
        {
          "id": "q${Date.now()}_1",
          "text": "Soru metni",
          "options": [
            {"id": "a", "text": "A şıkkı", "isCorrect": false},
            {"id": "b", "text": "B şıkkı", "isCorrect": true},
            {"id": "c", "text": "C şıkkı", "isCorrect": false},
            {"id": "d", "text": "D şıkkı", "isCorrect": false}
          ],
          "correctAnswer": "b",
          "explanation": "Sorunun detaylı çözümü ve neden doğru/yanlış olduğunun açıklaması",
          "difficulty": "${difficulty}",
          "timeLimit": ${difficulty === 'easy' ? 20 : difficulty === 'medium' ? 30 : difficulty === 'hard' ? 45 : 60}
        }
      ]
    }

    Notlar:
    - Her soru için 4 şık oluştur
    - Yanlış şıklar öğrencilerin yapabileceği tipik hataları yansıtmalı
    - Çözüm açıklaması çok detaylı olmalı (adım adım)
    - Türkçe olarak yaz
  `;

  try {
    const content = await requestGemini(prompt);

    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonContent = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonContent);
      return parsed.questions || [];
    }

    return [];
  } catch (error) {
    console.error('Question generation error:', error);
    return [];
  }
}

export async function generateInfographic(topic: Topic): Promise<Infographic> {
  const prompt = `
    ${topic.title} konusu için sade, minimalist ve modern temaya uygun vektörel bir infografik oluştur.

    Konu özeti: ${topic.summary}
    Önemli kavramlar: ${topic.keyConcepts.map(k => `${k.title}: ${k.content}`).join('\\n')}

    Aşağıdaki formatta JSON çıktı ver:

    {
      "id": "inf_${Date.now()}",
      "title": "${topic.title} - Özet İnfografiği",
      "content": "İnfografik içeriği - temel formüller, adımlar ve ipuçları",
      "imageUrl": "",
      "keyPoints": ["madde 1", "madde 2", "madde 3"],
      "steps": ["adım 1", "adım 2", "adım 3"],
      "vectorSvg": "<svg ...>...</svg>"
    }

    İçerik şunları içermeli:
    - Ana formüller ve kurallar
    - Adım adım çözüm stratejileri
    - Pratik ipuçları
    - vectorSvg alanında yalnızca geçerli SVG ver (script, foreignObject, iframe kullanma)
    - Renk paleti tema uyumlu olsun: #2B5D3A, #4A90E2, #F5A623, #F3F4F6
    - SVG boyutu 1200x700 olsun ve içerik okunaklı yerleşsin
    - Türkçe olarak yaz
  `;

  try {
    const content = await requestGemini(prompt);

    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonContent = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonContent);
      return {
        ...parsed,
        createdAt: new Date(),
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
        steps: Array.isArray(parsed.steps) ? parsed.steps : [],
        vectorSvg: typeof parsed.vectorSvg === 'string' ? parsed.vectorSvg : '',
        imageUrl: `https://via.placeholder.com/800x600/2B5D3A/ffffff?text=${encodeURIComponent(topic.title)}`
      };
    }

    throw new Error('Geçerli JSON bulunamadı');
  } catch (error) {
    console.error('Infographic generation error:', error);
    return {
      id: `inf_${Date.now()}`,
      title: `${topic.title} - Özet İnfografiği`,
      content: `${topic.keyConcepts.map(k => `${k.title}: ${k.content}`).join('\\n\\n')}`,
      imageUrl: `https://via.placeholder.com/800x600/2B5D3A/ffffff?text=${encodeURIComponent(topic.title)}`,
      keyPoints: topic.keyConcepts.slice(0, 4).map(k => k.title),
      steps: [
        'Temel kavramı tanımla',
        'Kuralı/formülü seç',
        'Adım adım işlemi uygula',
        'Sonucu kontrol et'
      ],
      vectorSvg: buildFallbackInfographicSvg(topic),
      createdAt: new Date()
    };
  }
}

function buildFallbackInfographicSvg(topic: Topic): string {
  const title = escapeXml(topic.title);
  const items = topic.keyConcepts.slice(0, 3).map((k, i) => {
    const y = 230 + i * 120;
    return `
      <rect x="80" y="${y}" width="1040" height="88" rx="14" fill="#ffffff" stroke="#d1d5db"/>
      <circle cx="125" cy="${y + 44}" r="18" fill="#2B5D3A"/>
      <text x="125" y="${y + 50}" font-size="14" text-anchor="middle" fill="#ffffff">${i + 1}</text>
      <text x="160" y="${y + 38}" font-size="22" font-weight="700" fill="#1f2937">${escapeXml(k.title)}</text>
      <text x="160" y="${y + 66}" font-size="16" fill="#4b5563">${escapeXml(k.content.slice(0, 78))}</text>
    `;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f8fafc"/>
        <stop offset="100%" stop-color="#eef6ff"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="700" fill="url(#bg)"/>
    <rect x="40" y="36" width="1120" height="120" rx="20" fill="#2B5D3A"/>
    <text x="70" y="90" font-size="36" font-weight="700" fill="#ffffff">${title}</text>
    <text x="70" y="128" font-size="20" fill="#d1fae5">Vektörel Konu Özeti</text>
    ${items}
  </svg>`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateFallbackTopic(unitTitle: string, topicTitle: string): Topic {
  return {
    id: `topic_${Date.now()}`,
    title: topicTitle,
    description: `${unitTitle} müfredatına uygun ${topicTitle} konusu`,
    summary: `Bu dersimizde ${topicTitle} konusunu işleyeceğiz. Konu, matematiksel düşünme becerilerini geliştirmek için tasarlanmıştır. Öğrenciler bu konuyu öğrendikten sonra, ilgili problemleri çözebilecek ve matematiksel kavramları günlük hayatla ilişkilendirebileceklerdir.`,
    keyConcepts: [
      {
        id: 'kc1',
        title: 'Temel Kavram',
        content: `${topicTitle} konusunun temelini oluşturan en önemli kavram. Bu kavramı anlamak, konunun geri kalanını kavramak için kritik öneme sahiptir.`,
        importance: 'high'
      },
      {
        id: 'kc2',
        title: 'Formüller ve Kurallar',
        content: `${topicTitle} konusunda kullanılan temel formüller ve kurallar. Bu formüller, problem çözümünde bize rehberlik eder.`,
        importance: 'high'
      },
      {
        id: 'kc3',
        title: 'Problem Çözme Stratejileri',
        content: `${topicTitle} ile ilgili problemleri çözmek için kullanılan stratejiler. Adım adım yaklaşım, doğru sonuca ulaşmamızı sağlar.`,
        importance: 'medium'
      }
    ],
    misconceptions: [
      {
        id: 'm1',
        wrongBelief: 'Öğrenciler genellikle bu konuda formülleri yanlış uygular.',
        correctExplanation: 'Formüller, doğru koşullar altında ve doğru sırayla uygulanmalıdır. Her formülün kullanım şartlarını bilmek önemlidir.',
        example: 'Formülü uygularken öncelikle verileri doğru şekilde analiz etmelisiniz.'
      },
      {
        id: 'm2',
        wrongBelief: 'Birçok öğrenci işlem önceliğini göz ardı eder.',
        correctExplanation: 'Matematiksel işlemlerde işlem önceliği kurallarına mutlaka uyulmalıdır. Parantez içi işlemler, çarpma ve bölme, toplama ve çıkarma sırası izlenmelidir.',
        example: '3 + 2 × 4 = 20 değil, 3 + 8 = 11 olmalıdır.'
      }
    ],
    examples: [
      {
        id: 'e1',
        problem: 'Örnek: 5x + 3 = 18 denkleminin çözümünü bulun.',
        solution: '5x = 18 - 3\\n5x = 15\\nx = 15 ÷ 5\\nx = 3',
        isCorrect: true,
        explanation: 'Denklem çözümünde önce bilinmeyeni yalnız bırakmak için terimleri eşitliğin diğer tarafına atarız.'
      },
      {
        id: 'e2',
        problem: 'Örnek: Bir üçgenin iç açıları toplamı kaç derecedir?',
        solution: 'Her üçgenin iç açıları toplamı 180° dir.',
        isCorrect: true,
        explanation: 'Bu temel bir geometri kuralıdır ve tüm üçgenler için geçerlidir.'
      },
      {
        id: 'e3',
        problem: 'Örnek: (-4) × (-3) işleminin sonucu nedir?',
        solution: '(-4) × (-3) = 12',
        isCorrect: true,
        explanation: 'İki negatif sayının çarpımı pozitif bir sayı verir.'
      }
    ],
    questions: [
      {
        id: 'q1',
        text: `${topicTitle} ile ilgili aşağıdakilerden hangisi doğrudur?`,
        options: [
          { id: 'a', text: 'A seçeneği - Yanlış ifade', isCorrect: false },
          { id: 'b', text: 'B seçeneği - Doğru ifade', isCorrect: true },
          { id: 'c', text: 'C seçeneği - Yanlış ifade', isCorrect: false },
          { id: 'd', text: 'D seçeneği - Yanlış ifade', isCorrect: false }
        ],
        correctAnswer: 'b',
        explanation: 'Bu soru, konunun temel kavramlarını test etmektedir. Doğru cevap B seçeneğidir çünkü...',
        difficulty: 'easy',
        timeLimit: 20
      },
      {
        id: 'q2',
        text: `Aşağıdaki işlemlerden hangisinin sonucu doğrudur?`,
        options: [
          { id: 'a', text: '8 ÷ 2 × 4 = 1', isCorrect: false },
          { id: 'b', text: '8 ÷ 2 × 4 = 16', isCorrect: true },
          { id: 'c', text: '8 ÷ 2 × 4 = 32', isCorrect: false },
          { id: 'd', text: '8 ÷ 2 × 4 = 8', isCorrect: false }
        ],
        correctAnswer: 'b',
        explanation: 'İşlem önceliğine göre önce bölme, sonra çarpma yapılır: 8 ÷ 2 = 4, 4 × 4 = 16.',
        difficulty: 'medium',
        timeLimit: 30
      },
      {
        id: 'q3',
        text: `Yeni nesil soru: Gerçek hayat durumu içeren karmaşık bir problem`,
        options: [
          { id: 'a', text: 'A şıkkı', isCorrect: false },
          { id: 'b', text: 'B şıkkı', isCorrect: true },
          { id: 'c', text: 'C şıkkı', isCorrect: false },
          { id: 'd', text: 'D şıkkı', isCorrect: false }
        ],
        correctAnswer: 'b',
        explanation: 'Bu soru, öğrencilerin günlük hayat problemlerini matematiksel olarak modelleme becerisini ölçmektedir...',
        difficulty: 'new_generation',
        timeLimit: 60
      }
    ]
  };
}

export async function generateSummary(topic: Topic): Promise<string> {
  const prompt = `
    ${topic.title} konusu için kısa ve özlü bir özet yaz.

    Konu içeriği:
    - ${topic.keyConcepts.map(k => k.title).join('\\n- ')}

    3-4 cümlelik bir özet yaz Türkçe olarak.
  `;

  try {
    return await requestGemini(prompt);
  } catch (error) {
    return `${topic.title} konusu, matematiksel düşünme becerilerini geliştirmek için tasarlanmıştır. Konunun temel kavramlarını anlamak, başarılı bir öğrenme için kritik öneme sahiptir.`;
  }
}
