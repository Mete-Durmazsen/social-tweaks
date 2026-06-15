# YouTube Shorts Otomatik Geçiş

Bir YouTube Short bittiğinde otomatik olarak bir sonraki short'a geçen Chrome
extension'ı (Manifest V3, TypeScript + Vite).

## Özellikler

- Short bitince otomatik olarak sonrakine geçer.
- Popup üzerinden **aç/kapa** ve **geçiş öncesi bekleme süresi** (saniye) ayarı.
- Ayarlar `chrome.storage.sync` ile kaydedilir ve anında uygulanır.

## Nasıl çalışır?

Shorts videoları varsayılan olarak sonsuz döngüde (`loop`) oynadığı için normal
`ended` olayı tetiklenmez. Eklenti aktif video'yu bulur, `loop`'u kapatır ve hem
`ended` hem de süre sonu (`timeupdate`) durumunu izler. Geçiş, YouTube'un
dinlediği `ArrowDown` klavye olayıyla; o işe yaramazsa aşağı yön navigasyon
butonuna tıklanarak yapılır. Detaylar: [`src/content.ts`](src/content.ts).

## Geliştirme

```bash
npm install
npm run build      # dist/ klasörünü üretir (tsc tip kontrolü + vite build)
# veya geliştirme + HMR için:
npm run dev
```

İkonları yeniden üretmek için: `node scripts/generate-icons.mjs`.

## Chrome'a yükleme

1. `npm run build` çalıştır.
2. `chrome://extensions` adresine git.
3. Sağ üstten **Developer mode**'u aç.
4. **Load unpacked** → bu projedeki `dist/` klasörünü seç.
5. Bir Shorts sayfası aç: `https://www.youtube.com/shorts/...`

> Not: `npm run dev` kullanırsan `dist/` yerine Vite'ın ürettiği klasörü yükle;
> üretim için `npm run build` önerilir.

## Gizlilik

Bu eklenti **hiçbir veri toplamaz**, hiçbir sunucuya istek göndermez ve hiçbir
analitik/izleme içermez. Tek sakladığı şey, senin ayarların (`enabled` ve
bekleme süresi) olup bunlar yalnızca tarayıcının `chrome.storage.sync` alanında
tutulur. Yalnızca `https://www.youtube.com/shorts/*` sayfalarında çalışır.

## Proje yapısı

```
src/
├── manifest.ts        # MV3 manifest tanımı
├── content.ts         # Otomatik geçiş mantığı
├── settings.ts        # Ayar tipi + storage yardımcıları
├── popup/             # Toggle + ayar arayüzü
└── icons/             # Üretilen ikonlar
```
