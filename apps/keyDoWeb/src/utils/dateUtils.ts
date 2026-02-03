import {
  format,
  isToday,
  isTomorrow,
  isPast,
  startOfDay,
  addDays,
  nextMonday,
  getDay,
  getDate,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { RecurrenceRule } from '@yuan-shan/keydo-contract';

/**
 * 获取今天的日期（00:00:00）
 */
export function getTodayDate(): Date {
  return startOfDay(new Date());
}

/**
 * 获取明天的日期（00:00:00）
 */
export function getTomorrowDate(): Date {
  return startOfDay(addDays(new Date(), 1));
}

/**
 * 获取下周一的日期（00:00:00）
 */
export function getNextMondayDate(): Date {
  return startOfDay(nextMonday(new Date()));
}

/**
 * 格式化任务日期显示
 * @param dateStr ISO 8601 格式的日期字符串
 * @param isAllDay 是否全天任务
 * @returns 格式化后的日期字符串
 */
export function formatTaskDate(dateStr: string, isAllDay: boolean): string {
  const date = new Date(dateStr);

  if (isToday(date)) {
    return isAllDay ? '今天' : `今天 ${format(date, 'HH:mm')}`;
  }

  if (isTomorrow(date)) {
    return isAllDay ? '明天' : `明天 ${format(date, 'HH:mm')}`;
  }

  // 其他日期
  const dateFormat = isAllDay ? 'M月d日' : 'M月d日 HH:mm';
  return format(date, dateFormat, { locale: zhCN });
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
 * 智能推导重复选项（根据选中的日期）
 * @param selectedDate 选中的日期
 * @returns 重复选项数组
 */
export function generateRecurrenceOptions(selectedDate: Date): Array<{
  value: string;
  label: string;
}> {
  const dayOfWeek = getDay(selectedDate);
  const dayOfMonth = getDate(selectedDate);
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
 * 判断任务是否过期
 * @param dueDate ISO 8601 格式的日期字符串
 * @returns 是否过期
 */
export function isOverdue(dueDate: string): boolean {
  const date = new Date(dueDate);
  return isPast(date) && !isToday(date);
}
