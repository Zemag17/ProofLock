export type LockSchedule = {
  days: number[]; // 1 = Monday ... 7 = Sunday
  start?: "HH:MM";
  end?: "HH:MM";
};

export type LockWithSchedule = {
  schedule?: LockSchedule | null;
};

function dayOfWeekUtc(date: Date): number {
  const d = date.getUTCDay(); // 0 = Sun
  return d === 0 ? 7 : d; // convert to 7 = Sun
}

function toMinutes(hhmm?: string): number | null {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(":").map((v) => Number(v));
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

export function isWithinSchedule(schedule: LockSchedule, date: Date): boolean {
  if (!schedule.days?.length) return false;

  const day = dayOfWeekUtc(date);
  if (!schedule.days.includes(day)) return false;

  const startMinutes = toMinutes(schedule.start);
  const endMinutes = toMinutes(schedule.end);
  const currentMinutes = date.getUTCHours() * 60 + date.getUTCMinutes();

  if (startMinutes === null && endMinutes === null) return true;
  if (startMinutes !== null && endMinutes === null) return currentMinutes >= startMinutes;
  if (startMinutes === null && endMinutes !== null) return currentMinutes <= endMinutes;

  // start and end both defined
  if (startMinutes === undefined || endMinutes === undefined) return false;

  if (endMinutes! >= startMinutes!) {
    return currentMinutes >= startMinutes! && currentMinutes <= endMinutes!;
  }

  // overnight window (e.g., 22:00 -> 06:00)
  return currentMinutes >= startMinutes! || currentMinutes <= endMinutes!;
}

export function isLockActiveNow<T extends LockWithSchedule>(lock: T, date: Date): boolean {
  if (!lock.schedule) return false;
  return isWithinSchedule(lock.schedule, date);
}

/**
 * Examples (pseudo-tests):
 *
 * const sched: LockSchedule = { days: [1,2,3,4,5], start: "09:00", end: "18:00" };
 * isWithinSchedule(sched, new Date("2024-01-02T10:00:00Z")) === true;  // Tuesday 10:00 UTC
 * isWithinSchedule(sched, new Date("2024-01-06T10:00:00Z")) === false; // Saturday
 *
 * const overnight: LockSchedule = { days: [5,6,7], start: "22:00", end: "06:00" };
 * isWithinSchedule(overnight, new Date("2024-01-05T23:30:00Z")) === true; // Friday late
 * isWithinSchedule(overnight, new Date("2024-01-06T05:30:00Z")) === true; // Saturday early
 * isWithinSchedule(overnight, new Date("2024-01-06T12:00:00Z")) === false;
 *
 * const openStart: LockSchedule = { days: [1], start: "08:00" };
 * isWithinSchedule(openStart, new Date("2024-01-01T09:00:00Z")) === true;
 * isWithinSchedule(openStart, new Date("2024-01-01T02:00:00Z")) === false;
 */
