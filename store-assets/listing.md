# Chrome Web Store — Mağaza Girişi Metinleri

Bu dosya, Web Store Developer Dashboard'a girilecek metinleri tutar (TR + EN).

## Hangi alan nereden geliyor?

| Alan | Kaynak | Not |
|---|---|---|
| **Başlık** (45) | Paket → `manifest.name` | "Social Tweaks" (iki dilde aynı). Otomatik gelir, dashboard'da düzenlenmez. |
| **Kısa özet** (132) | Paket → `manifest.description` (i18n) | v1.2.0 yüklenince dile göre otomatik: TR `_locales/tr`, EN `_locales/en`. |
| **Açıklama** (16.000) | Dashboard → Mağaza girişi → dil seç → elle yapıştır | Aşağıdaki uzun metinler. **Her dil için ayrı girilir.** |
| **Ekran görüntüleri / promo** | Dashboard → Grafik öğeler | TR: `store-assets/`, EN: `store-assets/en/` |

## ⚠️ Kategori uyarısı
Şu an **"Geliştirici Araçları"** seçili — bu **yanlış**. Bu bir geliştirici aracı değil;
medya tüketimini iyileştiren bir kullanıcı eklentisi. Yanlış kategori, yanlış kitleye
düşmek demek. Daha uygun seçenek: **Araçlar (Tools)** veya **Sadece Eğlence (Just for Fun)**.

---

## 🇹🇷 Türkçe

**Başlık:** Social Tweaks

**Kısa özet (116/132):**
> Sosyal medya için küçük iyileştirmeler: Shorts/Reels otomatik geçiş, YouTube dislike sayısı ve video pop-out butonu.

**Açıklama:**

```
Social Tweaks, sosyal medya deneyimini iyileştiren küçük ama işe yarar ayarlar sunar:

• YouTube Shorts — Otomatik geçiş: Bir Short bitince otomatik olarak sıradakine geçer; durmadan, elini sürmeden izlersin.
• YouTube — Dislike sayısı: YouTube'un arayüzden kaldırdığı beğenmeme (dislike) sayılarını video ve Shorts sayfalarında geri getirir.
• YouTube — Video pop-out: Normal YouTube videosunu hover'da görünen butonla Chrome'un Picture-in-Picture penceresine taşırsın.
• Instagram Reels — Otomatik geçiş: Bir Reel bitince sıradaki kendiliğinden gelir, akış hiç durmaz.

Her özelliği eklenti penceresinden ayrı ayrı açıp kapatabilirsin. Ücretsiz, reklamsız ve hesap gerektirmez.

Gizlilik: Hiçbir sunucuya veri göndermez, analitik veya takip içermez. Ayarların yalnızca tarayıcının kendi deposunda (chrome.storage.sync) durur. "Dislike sayısını göster" açıkken, yalnızca izlediğin videonun ID'si sayıyı almak için returnyoutubedislikeapi.com'a gönderilir; bu özelliği kapatırsan hiçbir istek yapılmaz.

Eklenti yalnızca YouTube (youtube.com) ve Instagram (instagram.com) sayfalarında çalışır.

Açık kaynak: https://github.com/Mete-Durmazsen/social-tweaks
```

**Önceki metne göre eklenenler:** video pop-out · dislike'ın Shorts'ta da çalıştığı · ücretsiz/reklamsız/hesapsız · hangi sitelerde çalıştığı · "dislike kapalıyken istek yok" netliği.

---

## 🇬🇧 English

**Title:** Social Tweaks

**Short summary (115/132):**
> Small improvements for social media: Shorts/Reels auto-advance, YouTube dislike counts, and a video pop-out button.

**Description:**

```
Social Tweaks offers small but genuinely useful tweaks that improve your social media experience:

• YouTube Shorts — Auto-advance: When a Short ends, it automatically moves to the next one, so you can keep watching hands-free.
• YouTube — Dislike count: Brings back the dislike counts YouTube removed from the interface, on both video and Shorts pages.
• YouTube — Video pop-out: Move a regular YouTube video into Chrome's native Picture-in-Picture window with a hover-only button.
• Instagram Reels — Auto-advance: When a Reel ends, the next one plays on its own and the feed never stops.

You can toggle each feature on or off independently from the extension popup. It's free, ad-free, and needs no account.

Privacy: It sends no data to any server and contains no analytics or tracking. Your settings stay only in your browser's own storage (chrome.storage.sync). When "Show dislike count" is on, only the ID of the video you're watching is sent to returnyoutubedislikeapi.com to fetch the count; turn that feature off and no requests are made.

The extension only runs on YouTube (youtube.com) and Instagram (instagram.com) pages.

Open source: https://github.com/Mete-Durmazsen/social-tweaks
```

---

## 📸 Görsel yükleme rehberi

| Öğe | Boyut | TR dosyası | EN dosyası |
|---|---|---|---|
| Ekran görüntüsü 1 | 1280×800 | `store-assets/screenshot-1-hero.png` | `store-assets/en/screenshot-1-hero.png` |
| Ekran görüntüsü 2 | 1280×800 | `store-assets/screenshot-2-features.png` | `store-assets/en/screenshot-2-features.png` |
| Küçük tanıtım bloğu | 440×280 | `store-assets/promo-small-440x280.png` | `store-assets/en/promo-small-440x280.png` |
| Kayan yazı tanıtım bloğu | 1400×560 | `store-assets/promo-marquee-1400x560.png` | `store-assets/en/promo-marquee-1400x560.png` |
| Mağaza simgesi | 128×128 | `store-assets/icon-128.png` | (ortak) |

İngilizce görselleri, ilgili dilin **"Yerelleştirilmiş ekran görüntüleri"** alanına yükle.

Görselleri yeniden üretmek için: `node scripts/generate-store-assets.mjs`
