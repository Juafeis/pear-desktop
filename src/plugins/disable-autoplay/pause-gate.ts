export type PauseDecision = {
  shouldPause: boolean;
  hasPaused: boolean;
};

export const getPauseDecision = (
  eventName: string,
  applyOnce: boolean,
  hasPaused: boolean,
): PauseDecision => {
  if (eventName !== 'dataloaded') {
    return { shouldPause: false, hasPaused };
  }

  if (applyOnce && hasPaused) {
    return { shouldPause: false, hasPaused };
  }

  return { shouldPause: true, hasPaused: true };
};
