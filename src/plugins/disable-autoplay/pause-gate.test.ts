import { test, expect } from '@playwright/test';

import { getPauseDecision } from './pause-gate';

test('apply once ignores unrelated events before the first data load', () => {
  const unrelatedEvent = getPauseDecision('dataupdated', true, false);

  expect(unrelatedEvent).toEqual({ shouldPause: false, hasPaused: false });
  expect(
    getPauseDecision('dataloaded', true, unrelatedEvent.hasPaused),
  ).toEqual({ shouldPause: true, hasPaused: true });
});

test('apply once pauses only the first data load', () => {
  const firstDataLoad = getPauseDecision('dataloaded', true, false);

  expect(firstDataLoad).toEqual({ shouldPause: true, hasPaused: true });
  expect(getPauseDecision('dataloaded', true, firstDataLoad.hasPaused)).toEqual(
    { shouldPause: false, hasPaused: true },
  );
});

test('regular mode pauses every data load', () => {
  expect(getPauseDecision('dataloaded', false, false)).toEqual({
    shouldPause: true,
    hasPaused: true,
  });
  expect(getPauseDecision('dataloaded', false, true)).toEqual({
    shouldPause: true,
    hasPaused: true,
  });
});

test('switching to apply once does not reset an existing pause', () => {
  const regularModePause = getPauseDecision('dataloaded', false, false);

  expect(
    getPauseDecision('dataloaded', true, regularModePause.hasPaused),
  ).toEqual({ shouldPause: false, hasPaused: true });
});
