# Social Tweaks — Yapılacaklar / Roadmap

Bu döküman, eklenti yayınlandıktan sonra yapılabilecek işleri bir araya
toplar. Önceliklendirilmiş başlıklar hâlinde; her madde tek başına ele
alınabilir. Tahmini iş yükü etiketleri: `S` (küçük), `M` (orta), `L` (büyük).

---

## 1. Yayın & Mağaza (Chrome Web Store)

- [ ] **Chrome Web Store'a yükleme** `M` — güncel `social-tweaks-v1.2.1.zip` paketini
      [Developer Dashboard](https://chrome.google.com/webstore/devconsole)
      üzerinden gönder. Tek seferlik **5 USD** geliştirici kaydı gerekir.
- [ ] **Mağaza listing içeriği** `S` — `store-assets/` içindeki görselleri
      kullan; başlık, kısa açıklama, detaylı açıklama (TR + EN), kategori
      (Productivity), ekran görüntüleri (1280×800 veya 640×400), küçük tile
      (440×280), tanıtım kutucuğu.
- [ ] **Gizlilik beyanı / data usage formu** `S` — Store'un zorunlu "Privacy
      practices" bölümünü doldur. `site/privacy.html` zaten var, oraya link ver.
      "Remote code" kullanmadığını, sadece dislike API'ye istek attığını belirt.
- [ ] **İzin gerekçeleri** `S` — `storage` ve `host_permissions` için
      mağazanın istediği "permission justification" metinlerini hazırla.
- [ ] **Firefox / Edge sürümü** `M` — Edge aynı paketle çalışır (Edge Add-ons
      ayrı submit). Firefox için `browser.*` API farkları ve MV3 manifest
      uyumu gözden geçirilmeli. İsteğe bağlı.

## 2. Web Sitesi (socialtweaks.online)

- [x] **sitemap.xml + robots.txt** — `site/sitemap.xml` + `site/robots.txt` eklendi.
- [x] **Open Graph / Twitter meta etiketleri** — index + privacy'ye eklendi,
      `site/assets/og.png` (1200×630) üretildi.
- [x] **SEO temel iyileştirmeleri** — canonical, theme-color, apple-touch-icon,
      JSON-LD (`SoftwareApplication` yapısal verisi) eklendi.
- [x] **404 sayfası** — `site/404.html` (GitHub Pages otomatik servis eder).
- [ ] **Google Search Console'a ekleme** `S` — siteyi doğrula (DNS TXT veya
      HTML meta tag), `sitemap.xml` gönder, indexlenmeyi takip et.
      *Senden:* doğrulama token'ı/dosyası gerekli.
- [ ] **Analytics** `M` — gizlilik dostu bir çözüm:
      [Plausible](https://plausible.io) veya [Umami](https://umami.is)
      (self-host, cookie'siz, KVKK/GDPR dostu). GA4 de seçenek ama cookie banner
      + gizlilik metni gerektirir. **Not:** eklenti "analitik içermez" diyor; bu
      yüzden analytics yalnızca *web sitesine* eklenmeli, eklentiye değil.
      *Senden:* araç seçimi + hesap.
- [ ] **Fontları self-host et** `S` — site şu an `fonts.googleapis.com`'dan Inter
      çekiyor; bu kullanıcı IP'sini Google'a sızdırır ve "takip yok" iddiasıyla
      çelişir. Inter'i `site/assets/` altına woff2 olarak indirip `@font-face` ile
      sun, Google preconnect'lerini kaldır.
- [ ] **"Chrome'a ekle" CTA butonu** `M` — Store onaylanınca kurulum bölümündeki
      "inceleme aşamasında" durum kartını, mağaza linkli "Chrome'a ekle" butonuyla
      değiştir (index.html `#kurulum`).
- [ ] **HTTPS zorlama** `S` — GitHub repo → Settings → Pages → "Enforce HTTPS"
      kutucuğunu işaretle. *Senden:* repo ayarı.
- [ ] **Çoklu dil (TR/EN)** `M` — site şu an Türkçe; İngilizce sürüm
      uluslararası kullanıcı için faydalı.

## 3. Eklenti — Yeni Özellikler

- [x] **YouTube video pop-out butonu** `M` — Normal YouTube videolarını native
      Picture-in-Picture penceresine alan, popup'tan göster/gizle yapılabilen buton.
- [ ] **TikTok otomatik geçiş** `M` — Shorts/Reels mantığının aynısı.
- [ ] **YouTube ana akış Shorts'larını gizle** `S` — ana sayfadaki/aboneliklerdeki
      Shorts rafını CSS ile gizleme seçeneği.
- [ ] **Oynatma hızı hafızası** `S` — Shorts/Reels için sabit oynatma hızı.
- [ ] **"Bir sonrakine geçmeden önce X saniye bekle"** `S` — ayarlanabilir gecikme.
- [ ] **Otomatik geçişi belli sayıda sonra durdur** `M` — "10 short sonra dur"
      gibi bir "scroll limiti" / dijital sağlık özelliği.
- [ ] **Instagram dışında daha fazla host** `M` — manifest'te şu an Instagram
      reels + YouTube var; Facebook Reels, Twitter/X video vb. değerlendirilebilir.
- [ ] **Klavye kısayolu** `S` — `commands` API ile aç/kapa toggle'ı.
- [ ] **İstatistik (yerel)** `M` — kaç short atlandı vb., sadece cihazda,
      `chrome.storage.local`. Gizliliği bozmadan "kullanım özeti".

## 4. Eklenti — Teknik Borç & Sağlamlık

- [ ] **Selector kırılganlığı izleme** `M` — YouTube/Instagram DOM'u sık
      değişiyor. Selector'lar bozulduğunda sessizce çalışmaması için
      defensive kontroller + konsol uyarıları. Birden fazla fallback selector.
- [ ] **Test altyapısı** `L` — şu an test yok. En azından `settings.ts`,
      `messages.ts` gibi saf mantık için birim testleri (vitest).
- [x] **CI/CD (temel)** — `.github/workflows/build.yml` push/PR'da `npm run build`
      çalıştırıyor; `deploy-pages.yml` siteyi otomatik deploy ediyor.
- [ ] **CI/CD (sürüm artifact'i)** `S` — tag atıldığında `.zip` paketini otomatik
      üretip GitHub Release'e iliştir; elle zip'lemeyi bırak.
- [ ] **Sürüm/changelog disiplini** `S` — `CHANGELOG.md` ekle, semantic
      versioning. Store güncellemeleri için faydalı.
- [ ] **Hata raporlama (opt-in)** `M` — gizlilik nedeniyle dikkatli; istenirse
      tamamen opsiyonel, varsayılan kapalı bir "sorun bildir" linki yeterli olabilir.
- [ ] **Lint + format** `S` — ESLint + Prettier ekle, tutarlılık için.

## 5. Topluluk & Büyüme

- [ ] **GitHub README rozetleri** `S` — Store sürüm/yükleme rozeti, lisans, build durumu.
- [ ] **CONTRIBUTING.md + issue/PR şablonları** `S` — katkı isteniyorsa.
- [ ] **Tanıtım** `S` — Product Hunt, ilgili subreddit'ler, kısa demo GIF/video.
- [ ] **Geri bildirim kanalı** `S` — GitHub Issues yeterli; veya basit bir form.

---

## Sırada ne var (öneri)

1. ~~Chrome Web Store submit~~ → **onayda bekliyor.**
2. ~~sitemap + OG + SEO temelleri~~ → **bitti** (bu commit).
3. **Search Console doğrulaması** — onay token'ı verince ekleyip sitemap'i göndereyim.
4. **HTTPS zorlama** — repo ayarından tek tık (sen).
5. **Analytics kararı** (Plausible vs Umami) — seçince siteye kurarım.
6. **Fontları self-host** — gizlilik tutarlılığı için.
7. Store onaylanınca **"Chrome'a ekle" CTA**'yı aktif et.
