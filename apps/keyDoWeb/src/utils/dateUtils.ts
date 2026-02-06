import { isPast, addDays } from 'date-fns';
import type { RecurrenceRule } from '@yuan-shan/keydo-contract';

/** 应用统一使用东八区（中国标准时间），不依赖用户本地时区 */
const TZ_ASIA_SHANGHAI = 'Asia/Shanghai';

/**
 * 获取东八区下某时刻的日期字符串 YYYY-MM-DD（供展示、存储、计算统一按东八区使用）
 */
export function getDateStringInUTC8(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: TZ_ASIA_SHANGHAI });
}

/**
 * 将 YYYY-MM-DD 和可选的 HH:mm 解析为东八区对应的时刻（Date 对象）
 */
export function parseDateInUTC8(dateStr: string, timeStr?: string): Date {
  const time = timeStr ? timeStr : '00:00';
  return new Date(`${dateStr}T${time}:00+08:00`);
}

/**
 * 获取东八区「今天」的 0 点时刻（Date）
 */
export function getTodayDate(): Date {
  const todayStr = getDateStringInUTC8(new Date());
  return parseDateInUTC8(todayStr, '00:00');
}

/**
 * 获取东八区「明天」的 0 点时刻（Date）
 */
export function getTomorrowDate(): Date {
  return addDays(getTodayDate(), 1);
}

/**
 * 获取东八区「下周一」的 0 点时刻（Date）
 */
export function getNextMondayDate(): Date {
  const today = getTodayDate();
  const dayOfWeek = getDayInUTC8(today);
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  return addDays(today, daysUntilMonday);
}

/** 东八区下某 Date 的星期几（0=周日, 1=周一, ..., 6=周六） */
function getDayInUTC8(date: Date): number {
  const utc8 = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  return utc8.getUTCDay();
}

/** 东八区下某 Date 的日期（1-31） */
function getDateInUTC8(date: Date): number {
  const utc8 = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  return utc8.getUTCDate();
}

/** 东八区下某时刻是否属于「今天」 */
export function isTodayInUTC8(date: Date): boolean {
  return getDateStringInUTC8(date) === getDateStringInUTC8(new Date());
}

/** 东八区下某时刻是否属于「明天」 */
export function isTomorrowInUTC8(date: Date): boolean {
  const tomorrowStr = getDateStringInUTC8(addDays(new Date(), 1));
  return getDateStringInUTC8(date) === tomorrowStr;
}

/**
 * 格式化任务日期显示（东八区）
 * @param dateStr 日期字符串（格式：YYYY-MM-DD）
 * @param timeStr 时间字符串（格式：HH:mm），可选
 * @returns 格式化后的日期字符串
 */
export function formatTaskDate(dateStr: string, timeStr?: string): string {
  const date = parseDateInUTC8(dateStr, timeStr);
  const timeDisplay = timeStr ? ` ${timeStr}` : '';

  if (isTodayInUTC8(date)) {
    return `今天${timeDisplay}`;
  }
  if (isTomorrowInUTC8(date)) {
    return `明天${timeDisplay}`;
  }
  const [, m, d] = dateStr.split('-');
  return `${parseInt(m, 10)}月${parseInt(d, 10)}日${timeDisplay}`;
}

/**
 * 格式化重复规则为中文描述
 * @param rule 重复规则
 * @returns 中文描述字符串
 */
export function formatRecurrence(rule: RecurrenceRule): string {
  switch (rule.type) {
    case 'DAILY':
      return '每天';
    case 'WEEKLY':
      if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return `每${weekdays[rule.daysOfWeek[0]]}`;
      }
      return '每周';
    case 'MONTHLY':
      if (rule.dayOfMonth) {
        return `每月${rule.dayOfMonth}日`;
      }
      return '每月';
    default:
      return '重复';
  }
}

/**
 * 智能推导重复选项（根据选中的日期，按东八区取星期几与几号）
 * @param selectedDate 选中的日期
 * @returns 重复选项数组
 */
export function generateRecurrenceOptions(selectedDate: Date): Array<{
  value: string;
  label: string;
}> {
  const dayOfWeek = getDayInUTC8(selectedDate);
  const dayOfMonth = getDateInUTC8(selectedDate);
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  return [
    {
      value: '__none__',
      label: '不重复',
    },
    {
      value: JSON.stringify({ type: 'DAILY', interval: 1 }),
      label: '每天',
    },
    {
      value: JSON.stringify({ type: 'WEEKLY', interval: 1, daysOfWeek: [dayOfWeek] }),
      label: `每${weekdays[dayOfWeek]}`,
    },
    {
      value: JSON.stringify({ type: 'MONTHLY', interval: 1, dayOfMonth }),
      label: `每月${dayOfMonth}日`,
    },
  ];
}

/**
 * 判断任务是否过期（截止时刻按东八区解析，过期 = 已过该时刻且不是东八区今天）
 * @param dueDate 日期字符串（格式：YYYY-MM-DD）
 * @param dueTime 时间字符串（格式：HH:mm），可选
 * @returns 是否过期
 */
export function isOverdue(dueDate: string, dueTime?: string): boolean {
  const date = parseDateInUTC8(dueDate, dueTime);
  return isPast(date) && !isTodayInUTC8(date);
}
