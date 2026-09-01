import assert from 'node:assert/strict';
import test from 'node:test';
import { getDueScheduleRuns, getScheduleDueAt, runScheduleActions } from '../src/hooks/scheduleTiming.ts';

test('runs a schedule whose time passed between timer checks', () => {
  const dueAt = getScheduleDueAt(
    { time: '18:00', enabled: true, weekdaysOnly: true },
    new Date(2026, 8, 2, 17, 59, 50),
    new Date(2026, 8, 2, 18, 1, 5)
  );

  assert.equal(dueAt?.getTime(), new Date(2026, 8, 2, 18, 0).getTime());
});

test('runs a schedule when a delayed timer check crosses midnight', () => {
  const dueAt = getScheduleDueAt(
    { time: '23:59', enabled: true, weekdaysOnly: false },
    new Date(2026, 8, 2, 23, 58, 50),
    new Date(2026, 8, 3, 0, 0, 5)
  );

  assert.equal(dueAt?.getTime(), new Date(2026, 8, 2, 23, 59).getTime());
});

test('honors exact boundaries, disabled rules, and weekday-only rules', () => {
  const scheduledAt = new Date(2026, 8, 2, 18, 0);
  const before = new Date(2026, 8, 2, 17, 59, 59);

  assert.equal(
    getScheduleDueAt({ time: '18:00', enabled: true, weekdaysOnly: true }, scheduledAt, new Date(2026, 8, 2, 18, 0, 1)),
    null
  );
  assert.equal(
    getScheduleDueAt({ time: '18:00', enabled: true, weekdaysOnly: true }, before, scheduledAt)?.getTime(),
    scheduledAt.getTime()
  );
  assert.equal(
    getScheduleDueAt({ time: '18:00', enabled: false, weekdaysOnly: false }, before, scheduledAt),
    null
  );
  assert.equal(
    getScheduleDueAt(
      { time: '18:00', enabled: true, weekdaysOnly: true },
      new Date(2026, 8, 5, 17, 59, 59),
      new Date(2026, 8, 5, 18, 0)
    ),
    null
  );
});

test('runs the latest missed schedule after a multi-day timer suspension', () => {
  const dueAt = getScheduleDueAt(
    { time: '18:00', enabled: true, weekdaysOnly: false },
    new Date(2026, 8, 1, 19, 0),
    new Date(2026, 8, 3, 10, 0)
  );

  assert.equal(dueAt?.getTime(), new Date(2026, 8, 2, 18, 0).getTime());
});

test('catches up multiple due rules in chronological order', () => {
  const runs = getDueScheduleRuns(
    [
      { id: 'later', time: '10:04', action: 'hadir', enabled: true, weekdaysOnly: false },
      { id: 'earlier', time: '10:02', action: 'off', enabled: true, weekdaysOnly: false },
    ],
    new Date(2026, 8, 2, 10, 1, 50),
    new Date(2026, 8, 2, 10, 5)
  );

  assert.deepEqual(runs.map(({ rule }) => rule.action), ['off', 'hadir']);
});

test('waits for each caught-up action before running the next one', async () => {
  const events: string[] = [];

  await runScheduleActions(
    [
      { action: 'off' },
      { action: 'hadir' },
    ],
    {
      onSnapshotBeforeOff: async () => {
        events.push('snapshot');
      },
      onTriggerStatus: async (status) => {
        events.push(status);
      },
    }
  );

  assert.deepEqual(events, ['snapshot', 'off', 'hadir']);
});
