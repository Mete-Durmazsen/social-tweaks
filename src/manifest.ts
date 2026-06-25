import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: 'Social Tweaks',
  description: '__MSG_appDesc__',
  default_locale: 'en',
  version: '1.2.0',
  permissions: ['storage'],
  host_permissions: ['https://www.youtube.com/*', 'https://returnyoutubedislikeapi.com/*'],
  background: {
    service_worker: 'src/background.ts',
    type: 'module',
  },
  action: {
    default_popup: 'src/popup/popup.html',
    default_title: 'Social Tweaks',
    default_icon: {
      '16': 'src/icons/icon16.png',
      '48': 'src/icons/icon48.png',
      '128': 'src/icons/icon128.png',
    },
  },
  icons: {
    '16': 'src/icons/icon16.png',
    '48': 'src/icons/icon48.png',
    '128': 'src/icons/icon128.png',
  },
  content_scripts: [
    {
      matches: ['https://www.youtube.com/*'],
      js: ['src/youtube-popout.ts'],
      run_at: 'document_idle',
    },
    {
      matches: ['https://www.youtube.com/shorts/*'],
      js: ['src/content.ts'],
      run_at: 'document_idle',
    },
    {
      matches: ['https://www.youtube.com/watch*', 'https://www.youtube.com/shorts/*'],
      js: ['src/dislikes.ts'],
      run_at: 'document_idle',
    },
    {
      matches: ['https://www.instagram.com/reels/*', 'https://www.instagram.com/reel/*'],
      js: ['src/instagram.ts'],
      run_at: 'document_idle',
    },
  ],
});
