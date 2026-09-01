import type { PresenceStatus, ScheduleRule } from '../types';

type TimedRule = Pick<ScheduleRule, 'enabled' | 'time' | 'weekdaysOnly'>;
type ScheduledAction = Pick<ScheduleRule, 'action'>;

interface ScheduleActionHandlers {
  onTriggerStatus: (status: PresenceStatus) => Promise<void>;
  onRestorePreset?: () => Promise<{ success: boolean; error?: string }>;
  onSnapshotBeforeOff?: () => Promise<{ success: boolean; error?: string }>;
}

export interface DueScheduleRun {
  rule: ScheduleRule;
  dueAt: Date;
}

function atScheduledTime(reference: Date, hours: number, minutes: number): Date {
  const scheduledAt = new Date(reference);
  scheduledAt.setHours(hours, minutes, 0, 0);
  return scheduledAt;
}

export function getScheduleDueAt(rule: TimedRule, previousCheck: Date, now: Date): Date | null {
  if (!rule.enabled || previousCheck > now) return null;

  const [hours, minutes] = rule.time.split(':').map(Number);
  const dueAt = atScheduledTime(now, hours, minutes);
  if (dueAt > now) dueAt.setDate(dueAt.getDate() - 1);

  if (rule.weekdaysOnly) {
    while (dueAt.getDay() === 0 || dueAt.getDay() === 6) {
      dueAt.setDate(dueAt.getDate() - 1);
    }
  }

  return previousCheck < dueAt ? dueAt : null;
}

export function getDueScheduleRuns(
  rules: readonly ScheduleRule[],
  previousCheck: Date,
  now: Date
): DueScheduleRun[] {
  const runs: DueScheduleRun[] = [];

  for (const rule of rules) {
    const dueAt = getScheduleDueAt(rule, previousCheck, now);
    if (dueAt) runs.push({ rule, dueAt });
  }

  return runs.sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());
}

export async function runScheduleActions(
  rules: readonly ScheduledAction[],
  { onTriggerStatus, onRestorePreset, onSnapshotBeforeOff }: ScheduleActionHandlers
): Promise<void> {
  for (const rule of rules) {
    if (rule.action === 'restore_preset') {
      if (onRestorePreset) await onRestorePreset();
    } else if (rule.action === 'off') {
      if (onSnapshotBeforeOff) await onSnapshotBeforeOff();
      await onTriggerStatus('off');
    } else {
      await onTriggerStatus(rule.action);
    }
  }
}
