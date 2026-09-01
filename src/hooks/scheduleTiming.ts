import type { ScheduleRule } from '../types';

type TimedRule = Pick<ScheduleRule, 'enabled' | 'time' | 'weekdaysOnly'>;

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
