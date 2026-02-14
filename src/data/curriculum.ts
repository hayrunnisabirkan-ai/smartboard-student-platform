import { Unit, Topic } from '../types';

const WEB_SOURCE_NOTE =
  'Konu başlıkları web kaynaklı MEB/ODM konu dağılım tablolarından derlenmiştir.';

function buildTopic(id: string, title: string, description: string): Topic {
  return {
    id,
    title,
    description,
    summary: `${title} konusu için "Ne Öğrendim?" özeti burada gösterilir. ${WEB_SOURCE_NOTE}`,
    keyConcepts: [],
    misconceptions: [],
    examples: [],
    questions: [],
  };
}

export const curriculumSources = {
  mebProgram: 'https://tymm.meb.gov.tr/ortaokul-matematik-dersi',
  grade5: 'https://canakkaleodm.meb.gov.tr/meb_iys_dosyalar/2025_09/11153014_5mat.xlsx',
  grade6: 'https://canakkaleodm.meb.gov.tr/meb_iys_dosyalar/2025_09/11153014_6mat.xlsx',
  grade7: 'https://canakkaleodm.meb.gov.tr/meb_iys_dosyalar/2025_09/11093626_7mat.xlsx',
  grade8: 'https://canakkaleodm.meb.gov.tr/meb_iys_dosyalar/2025_09/11093626_8mat.xlsx',
  fetchedAt: '2026-02-09',
} as const;

export function getInitialCurriculumUnits(): Unit[] {
  return [
    {
      id: 'grade-5',
      title: '5. Sınıf Matematik',
      description: 'MEB/ODM web kaynaklarından derlenen ünite ve konu akışı',
      grade: 5,
      topics: [
        buildTopic('g5-t1', 'Doğal Sayılar ve İşlemler', 'Çok basamaklı sayılar, çözümleme ve dört işlem problemleri'),
        buildTopic('g5-t2', 'Temel Geometrik Çizimler', 'Doğru, açı ölçme ve geometrik araç kullanımı'),
        buildTopic('g5-t3', 'Çokgenler ve Üçgen İnşası', 'Çokgen özellikleri ve çember yardımıyla üçgen oluşturma'),
        buildTopic('g5-t4', 'Dikdörtgende Çevre ve Alan', 'Çevre-uzunluk ilişkisi ve birim kare ile alan hesabı'),
      ],
    },
    {
      id: 'grade-6',
      title: '6. Sınıf Matematik',
      description: 'MEB/ODM web kaynaklarından derlenen ünite ve konu akışı',
      grade: 6,
      topics: [
        buildTopic('g6-t1', 'Doğal Sayıların Çarpanları ve Katları', 'Çarpan, kat, bölünebilme, asal çarpan, EBOB-EKOK'),
        buildTopic('g6-t2', 'Kesirlerle İşlemler', 'Kesir-bölme ilişkisi ve kesirlerle problem çözme'),
        buildTopic('g6-t3', 'Ondalık Gösterimler', 'Ondalık gösterimlerin basamak değeri ve dönüşümler'),
        buildTopic('g6-t4', 'Kategorik ve Nicel Veri Dağılımları', 'Veriyi yorumlama ve veriye dayalı karar verme'),
        buildTopic('g6-t5', 'Deneysel Olasılık', 'Gözleme dayalı olasılık tahmini'),
      ],
    },
    {
      id: 'grade-7',
      title: '7. Sınıf Matematik',
      description: 'MEB/ODM web kaynaklarından derlenen ünite ve konu akışı',
      grade: 7,
      topics: [
        buildTopic('g7-t1', 'Tam Sayılarla İşlemler', 'Toplama, çıkarma, çarpma, bölme ve üslü ifade bağlantısı'),
        buildTopic('g7-t2', 'Rasyonel Sayılar', 'Sayı doğrusunda gösterim, karşılaştırma ve ondalık gösterim'),
        buildTopic('g7-t3', 'Rasyonel Sayılarla İşlemler', 'Dört işlem, çok adımlı işlemler, kare-küp ve problemler'),
        buildTopic('g7-t4', 'Cebirsel İfadeler ve Örüntüler', 'Cebirsel ifadelerde işlem ve örüntü kuralını harfle ifade etme'),
      ],
    },
    {
      id: 'grade-8',
      title: '8. Sınıf Matematik',
      description: 'MEB/ODM web kaynaklarından derlenen ünite ve konu akışı',
      grade: 8,
      topics: [
        buildTopic('g8-t1', 'Çarpanlar ve Katlar', 'EBOB-EKOK, aralarında asallık, çarpan analizi'),
        buildTopic('g8-t2', 'Üslü İfadeler', 'Üslü ifadeler, bilimsel gösterim ve 10’un kuvvetleri'),
        buildTopic('g8-t3', 'Kareköklü İfadeler', 'Karekök işlemleri, gerçek sayılar ve sayı kümeleri'),
        buildTopic('g8-t4', 'Veri İşleme', 'Sütun/çizgi/daire grafik yorumlama ve dönüşüm'),
        buildTopic('g8-t5', 'Olasılık', 'Olası durumlar, eş olasılık ve basit olay olasılığı'),
        buildTopic('g8-t6', 'Cebir', 'Cebirsel ifade, özdeşlik, çarpanlara ayırma'),
      ],
    },
  ];
}
