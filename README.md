# Social Tweaks

Sosyal medya deneyimini iyileştiren küçük ayarlar bütünü — tek bir Chrome
extension'ı (Manifest V3, TypeScript + Vite). Zamanla farklı platformlar ve
özellikler eklenecek şekilde tasarlandı.

## Özellikler

### YouTube Shorts — Otomatik geçiş
- Short bitince otomatik olarak sonrakine geçer.
- Popup üzerinden **aç/kapa** ayarı.
- Ayarlar `chrome.storage.sync` ile kaydedilir ve anında uygulanır.

### YouTube — Dislike sayısını gösterme
- Video sayfalarında (`/watch`) ve Shorts'ta (`/shorts/...`) YouTube'un
  arayüzden kaldırdığı **dislike sayısını** dislike butonunun yanında gösterir.
- Sayı, [returnyoutubedislikeapi.com](https://returnyoutubedislikeapi.com)
  API'sinden alınır (bkz. [Anarios/return-youtube-dislike](https://github.com/Anarios/return-youtube-dislike)).
- Popup üzerinden **aç/kapa** edilebilir.

### Instagram Reels — Otomatik geçiş
- Reel bitince otomatik olarak sonrakine geçer.
- Popup üzerinden **aç/kapa** ayarı.

### Planlanan
- (öneriler memnuniyetle karşılanır)

## Nasıl çalışır?

Shorts videoları varsayılan olarak sonsuz döngüde (`loop`) oynadığı için normal
`ended` olayı tetiklenmez. Eklenti aktif video'yu bulur, `loop`'u kapatır ve hem
`ended` hem de süre sonu (`timeupdate`) durumunu izler. Geçiş, YouTube'un
dinlediği `ArrowDown` klavye olayıyla; o işe yaramazsa aşağı yön navigasyon
butonuna tıklanarak yapılır. Detaylar: [`src/content.ts`](src/content.ts).

### Dislike sayısı

[`src/dislikes.ts`](src/dislikes.ts), video sayfasındaki `v` parametresinden
video ID'sini alır ve [`src/background.ts`](src/background.ts)'a mesaj
göndererek dislike sayısını sorar. İstek background service worker'dan
yapılır (içerik script'lerinde sayfanın CSP'si nedeniyle dış API'ye `fetch`
güvenilir değildir). Sonuç, dislike butonunun yanına bir etiket olarak
eklenir; video değişimleri `yt-navigate-finish` olayıyla yakalanır.

### Instagram Reels

[`src/instagram.ts`](src/instagram.ts), YouTube Shorts ile aynı mantığı
izler: ekranda görünen Reel videosunun `loop`'unu kapatır, `ended` ve
`timeupdate` ile video sonunu yakalar. Geçiş için önce `ArrowDown` klavye
olayı gönderilir; işe yaramazsa videoyu içeren kaydırılabilir alan bir ekran
yüksekliği kaydırılır.

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
5. Bir Shorts sayfası aç: `https://www.youtube.com/shorts/...`, bir video
   sayfası aç: `https://www.youtube.com/watch?v=...` veya bir Instagram Reels
   sayfası aç: `https://www.instagram.com/reels/...`

> Not: `npm run dev` kullanırsan `dist/` yerine Vite'ın ürettiği klasörü yükle;
> üretim için `npm run build` önerilir.

## Gizlilik

Bu eklenti kendi sunucularına hiçbir veri göndermez, analitik/izleme içermez.
Ayarların (`enabled`, `showDislikes`, `instagramEnabled`) tek
saklandığı yer tarayıcının `chrome.storage.sync` alanıdır.

"Dislike sayısını göster" özelliği **açıkken**, izlediğin videonun ID'si
dislike sayısını almak için [returnyoutubedislikeapi.com](https://returnyoutubedislikeapi.com)'a
gönderilir (bu, üçüncü taraf bir servistir). Bu özelliği popup'tan kapatırsan
hiçbir istek yapılmaz.

Eklenti yalnızca `https://www.youtube.com/shorts/*`,
`https://www.youtube.com/watch*` ve `https://www.instagram.com/reel(s)/*`
sayfalarında çalışır.

## Proje yapısı

```
src/
├── manifest.ts        # MV3 manifest tanımı
├── content.ts         # Shorts otomatik geçiş mantığı
├── instagram.ts       # Instagram Reels otomatik geçiş mantığı
├── dislikes.ts        # Dislike sayısı gösterimi (content script)
├── background.ts      # Dislike API isteklerini yapan service worker
├── messages.ts        # content <-> background mesaj tipleri
├── settings.ts        # Ayar tipi + storage yardımcıları
├── popup/             # Toggle + ayar arayüzü
└── icons/             # Üretilen ikonlar
```
