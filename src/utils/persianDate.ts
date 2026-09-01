import { toJalaali, toGregorian, jalaaliMonthLength, isLeapJalaaliYear } from 'jalaali-js';
import { TaskItem } from '../types';

/**
 * Utilities for Persian numbers, Jalali date conversion, and formatting
 */

const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianDigits(input: number | string | undefined | null): string {
  if (input === undefined || input === null) return '';
  const str = input.toString();
  return str.replace(/[0-9]/g, (w) => persianDigits[parseInt(w, 10)]);
}

export function toEnglishDigits(str: string): string {
  if (!str) return '';
  let result = str;
  persianDigits.forEach((digit, index) => {
    result = result.replace(new RegExp(digit, 'g'), index.toString());
  });
  return result;
}

/**
 * Gregorian to Jalali (Solar Hijri) Date Conversion
 */
export function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  try {
    const res = toJalaali(gy, gm, gd);
    return [res.jy, res.jm, res.jd];
  } catch {
    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let jy = gy <= 1600 ? 0 : 979;
    gy -= gy <= 1600 ? 621 : 1600;
    const gy2 = gm > 2 ? gy + 1 : gy;
    let days =
      365 * gy +
      Math.floor((gy2 + 3) / 4) -
      Math.floor((gy2 + 99) / 100) +
      Math.floor((gy2 + 399) / 400) -
      80 +
      gd +
      g_d_m[gm - 1];
    jy += 33 * Math.floor(days / 12053);
    days %= 12053;
    jy += 4 * Math.floor(days / 1461);
    days %= 1461;
    if (days > 365) {
      jy += Math.floor((days - 1) / 365);
      days = (days - 1) % 365;
    }
    const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
    const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
    return [jy, jm, jd];
  }
}

/**
 * Jalali to Gregorian Date Conversion
 */
export function jalaliToGregorian(jy: number, jm: number, jd: number): Date {
  try {
    const g = toGregorian(jy, jm, jd);
    return new Date(g.gy, g.gm - 1, g.gd);
  } catch {
    return new Date();
  }
}

export const PERSIAN_MONTH_NAMES = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

// In Persian calendar, weeks start on Saturday:
// 0: شنبه, 1: یک‌شنبه, 2: دوشنبه, 3: سه‌شنبه, 4: چهارشنبه, 5: پنج‌شنبه, 6: جمعه
export const PERSIAN_WEEKDAYS_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

export const PERSIAN_WEEKDAYS_FULL = [
  'شنبه', 'یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'
];

export const PERSIAN_WEEKDAYS = [
  'یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'
];

/**
 * Get weekday index where Saturday = 0, Sunday = 1, ..., Friday = 6
 */
export function getJalaliWeekdayIndex(jy: number, jm: number, jd: number): number {
  const gDate = jalaliToGregorian(jy, jm, jd);
  // In JS Date: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const jsDay = gDate.getDay();
  // Map so Saturday (6) is 0, Sunday (0) is 1, etc.
  return (jsDay + 1) % 7;
}

export function getTodayJalaliDate(date = new Date()) {
  const [jy, jm, jd] = gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const standardString = `${jy}/${pad(jm)}/${pad(jd)}`;
  const formattedPersian = `${toPersianDigits(jy)}/${toPersianDigits(pad(jm))}/${toPersianDigits(pad(jd))}`;
  const reportId = `REP-${jy.toString().slice(-2)}${pad(jm)}${pad(jd)}-A`;
  const monthName = PERSIAN_MONTH_NAMES[jm - 1];
  const weekdayIndex = getJalaliWeekdayIndex(jy, jm, jd);
  const weekday = PERSIAN_WEEKDAYS_FULL[weekdayIndex];
  const fullDate = `${weekday} ${toPersianDigits(jd)} ${monthName} ${toPersianDigits(jy)}`;

  return {
    year: jy,
    month: jm,
    day: jd,
    weekdayIndex,
    standardString,
    formattedPersian,
    reportId,
    monthName,
    weekday,
    fullDate,
  };
}

export function getTodayJalaliString(date = new Date()): {
  formatted: string;
  persianDigitsFormatted: string;
  fullDate: string;
  docId: string;
} {
  const info = getTodayJalaliDate(date);
  return {
    formatted: info.standardString,
    persianDigitsFormatted: info.formattedPersian,
    fullDate: info.fullDate,
    docId: info.reportId
  };
}

export function formatTimePersian(date: Date = new Date()): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return toPersianDigits(`${hours}:${minutes}`);
}

/**
 * Get days count in a Jalali month
 */
export function getJalaliMonthLength(jy: number, jm: number): number {
  try {
    return jalaaliMonthLength(jy, jm);
  } catch {
    if (jm <= 6) return 31;
    if (jm <= 11) return 30;
    return isLeapJalaaliYear(jy) ? 30 : 29;
  }
}

/**
 * Normalize Persian weekday name (removes spaces and half-spaces for robust comparison)
 */
export function normalizePersianWeekday(day: string): string {
  if (!day) return '';
  return day.replace(/[\s\u200C]/g, '').trim();
}

/**
 * Returns true if a task applies today based on its taskType:
 * - 'shift_start' / 'shift_end': always true
 * - 'recurring_weekly': true if today's Jalali weekday is in task.weekdays
 * - 'one_time': true if today's Jalali date equals task.fixedDate
 */
export function doesTaskApplyToday(
  task: TaskItem,
  todayStr: string = getTodayJalaliDate().standardString,
  todayWeekday: string = getTodayJalaliDate().weekday
): boolean {
  if (task.taskType === 'shift_start' || task.taskType === 'shift_end') {
    return true;
  }
  if (task.taskType === 'recurring_weekly') {
    if (!task.weekdays || task.weekdays.length === 0) return true;
    const normToday = normalizePersianWeekday(todayWeekday);
    return task.weekdays.some((d) => normalizePersianWeekday(d) === normToday);
  }
  if (task.taskType === 'one_time') {
    return task.fixedDate === todayStr;
  }
  return false;
}

/**
 * Returns true if a task occurs on a given Jalali date string
 */
export function isTaskOccurringOnDate(task: TaskItem, targetDateStr: string): boolean {
  const [tY, tM, tD] = targetDateStr.split('/').map(Number);
  const weekdayIndex = getJalaliWeekdayIndex(tY, tM, tD);
  const targetWeekday = PERSIAN_WEEKDAYS_FULL[weekdayIndex];
  return doesTaskApplyToday(task, targetDateStr, targetWeekday);
}
