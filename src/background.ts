import { isFetchDislikesMessage } from './messages';

const API_URL = 'https://returnyoutubedislikeapi.com/votes';

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  if (!isFetchDislikesMessage(message)) return;

  fetch(`${API_URL}?videoId=${encodeURIComponent(message.videoId)}`)
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
    .then((data: { dislikes?: number }) => {
      sendResponse(typeof data.dislikes === 'number' ? data.dislikes : null);
    })
    .catch(() => sendResponse(null));

  return true;
});
