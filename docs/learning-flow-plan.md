# 5-8. Sınıf Matematik Öğrenme Akışı (Sade/Minimal/Modern)

## 1) Hedef Akış
1. Öğrenci sınıf ve konuyu seçer.
2. Sistem web kaynaklı konu başlığına göre içeriği Gemini ile üretir.
3. `Ne Öğrendim?` sekmesinde kısa özet + görselle pekiştirme gösterilir.
4. `Kavram Kartları` sekmesinde kritik noktalar + kavram yanılgıları gösterilir.
5. `Konu Pekiştirme` kısmında doğru/yanlış örnekler renk kodlarıyla sunulur.
6. `Zamana Karşı` testte orta-zor-yeni nesil sorular süreli çözülür.
7. Her soru sonrası detaylı çözüm açıklaması gösterilir.
8. Test sonunda derece verilir: `Çok İyi / İyi / Orta / Zayıf`.

## 2) Web Kaynakları (09 Şubat 2026)
- TYMM Matematik içerik sayfaları: `https://tymm.meb.gov.tr/ortaokul-matematik-dersi`
- 5. sınıf ODM tablo: `https://canakkaleodm.meb.gov.tr/meb_iys_dosyalar/2025_09/11153014_5mat.xlsx`
- 6. sınıf ODM tablo: `https://canakkaleodm.meb.gov.tr/meb_iys_dosyalar/2025_09/11153014_6mat.xlsx`
- 7. sınıf ODM tablo: `https://canakkaleodm.meb.gov.tr/meb_iys_dosyalar/2025_09/11093626_7mat.xlsx`
- 8. sınıf ODM tablo: `https://canakkaleodm.meb.gov.tr/meb_iys_dosyalar/2025_09/11093626_8mat.xlsx`

## 3) Uygulama Kararları
- Müfredat başlangıç verisi `src/data/curriculum.ts` içinde tutulur.
- Gemini anahtarı kodda tutulmaz; `.env` üzerinden alınır.
- Soru süreleri: orta `30s`, zor `45s`, yeni nesil `60s`.
- Test değerlendirmesi kullanıcıya sade metinle sunulur.
