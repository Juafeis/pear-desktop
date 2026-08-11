import { expect, test } from '@playwright/test';

import { getPlaybackSnapshot, shouldPlayWhenToggling } from './media-playback';

test('reports an initial pause at zero seconds', () => {
  expect(getPlaybackSnapshot(true, 0)).toEqual({
    isPaused: true,
    elapsedSeconds: 0,
  });
});

test('reports playback events at zero seconds', () => {
  expect(getPlaybackSnapshot(false, 0)).toEqual({
    isPaused: false,
    elapsedSeconds: 0,
  });
});

test('toggle trusts the media element over a stale player state', () => {
  expect(shouldPlayWhenToggling(true, 1)).toBe(true);
  expect(shouldPlayWhenToggling(false, 2)).toBe(false);
});

test('toggle falls back to the player state without a media element', () => {
  expect(shouldPlayWhenToggling(undefined, 2)).toBe(true);
  expect(shouldPlayWhenToggling(undefined, 1)).toBe(false);
});
