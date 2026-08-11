export type PlaybackSnapshot = {
  isPaused: boolean;
  elapsedSeconds: number;
};

export const getPlaybackSnapshot = (
  isPaused: boolean,
  currentTime: number,
): PlaybackSnapshot => ({
  isPaused,
  elapsedSeconds: Math.floor(currentTime),
});

export const shouldPlayWhenToggling = (
  videoPaused: boolean | undefined,
  playerState: number | undefined,
): boolean => videoPaused ?? playerState === 2;
