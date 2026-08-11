import { t } from '@/i18n';
import { createPlugin } from '@/utils';

import { getPauseDecision } from './pause-gate';

import type { MusicPlayer } from '@/types/music-player';
import type { VideoDataChanged } from '@/types/video-data-changed';

export type DisableAutoPlayPluginConfig = {
  enabled: boolean;
  applyOnce: boolean;
};

export default createPlugin<
  unknown,
  unknown,
  {
    config: DisableAutoPlayPluginConfig | null;
    api: MusicPlayer | null;
    hasPaused: boolean;
    pendingVideo: HTMLVideoElement | null;
    fallbackTimeout: number | null;
    clearPendingPause: () => void;
    eventListener: (event: CustomEvent<VideoDataChanged>) => void;
    timeUpdateListener: (e: Event) => void;
  },
  DisableAutoPlayPluginConfig
>({
  name: () => t('plugins.disable-autoplay.name'),
  description: () => t('plugins.disable-autoplay.description'),
  restartNeeded: false,
  config: {
    enabled: false,
    applyOnce: false,
  },
  menu: async ({ getConfig, setConfig }) => {
    const config = await getConfig();

    return [
      {
        label: t('plugins.disable-autoplay.menu.apply-once'),
        type: 'checkbox',
        checked: config.applyOnce,
        async click() {
          const nowConfig = await getConfig();
          setConfig({
            applyOnce: !nowConfig.applyOnce,
          });
        },
      },
    ];
  },
  renderer: {
    config: null,
    api: null,
    hasPaused: false,
    pendingVideo: null,
    fallbackTimeout: null,
    clearPendingPause() {
      this.pendingVideo?.removeEventListener(
        'timeupdate',
        this.timeUpdateListener,
      );
      this.pendingVideo = null;

      if (this.fallbackTimeout !== null) {
        window.clearTimeout(this.fallbackTimeout);
        this.fallbackTimeout = null;
      }
    },
    eventListener(event: CustomEvent<VideoDataChanged>) {
      const decision = getPauseDecision(
        event.detail.name,
        this.config?.applyOnce ?? false,
        this.hasPaused,
      );
      this.hasPaused = decision.hasPaused;

      if (!decision.shouldPause) {
        return;
      }

      this.clearPendingPause();
      this.api?.pauseVideo();

      const video = document.querySelector<HTMLVideoElement>('video');
      if (!video) {
        return;
      }

      this.pendingVideo = video;
      video.addEventListener('timeupdate', this.timeUpdateListener, {
        once: true,
      });
      this.fallbackTimeout = window.setTimeout(() => {
        this.clearPendingPause();
      }, 1500);
    },
    timeUpdateListener(e: Event) {
      const video = e.currentTarget;
      this.clearPendingPause();

      if (video instanceof HTMLVideoElement) {
        video.pause();
      }
    },
    async start({ getConfig }) {
      this.clearPendingPause();
      this.hasPaused = false;
      this.config = await getConfig();
    },
    onPlayerApiReady(api) {
      this.api = api;

      document.addEventListener('videodatachange', this.eventListener);
    },
    stop() {
      document.removeEventListener('videodatachange', this.eventListener);
      this.clearPendingPause();
      this.api = null;
    },
    onConfigChange(newConfig) {
      this.config = newConfig;
    },
  },
});
