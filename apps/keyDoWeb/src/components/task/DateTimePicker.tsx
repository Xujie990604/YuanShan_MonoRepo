import { useState, useMemo, useEffect } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { zhCN } from 'date-fns/locale';
import type { RecurrenceRule } from '@yuan-shan/keydo-contract';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  getTodayDate,
  getTomorrowDate,
  getNextMondayDate,
  formatTaskDate,
  generateRecurrenceOptions,
} from '@/utils/dateUtils';

interface DateTimePickerProps {
  value?: {
    dueDate?: string;
    isAllDay?: boolean;
    recurrence?: RecurrenceRule;
  };
  onChange: (value: {
    dueDate?: string;
    isAllDay?: boolean;
    recurrence?: RecurrenceRule;
  }) => void;
}

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    value?.dueDate ? new Date(value.dueDate) : undefined
  );
  // 默认不包含时间（全天任务）
  const [includeTime, setIncludeTime] = useState(
    value?.isAllDay !== undefined ? !value.isAllDay : false
  );
  const [selectedHour, setSelectedHour] = useState(
    value?.dueDate ? new Date(value.dueDate).getHours() : 9
  );
  const [selectedMinute, setSelectedMinute] = useState(
    value?.dueDate ? new Date(value.dueDate).getMinutes() : 0
  );
  const [recurrenceValue, setRecurrenceValue] = useState(
    value?.recurrence ? JSON.stringify(value.recurrence) : '__none__'
  );

  // 当 value prop 改变时，同步内部状态
  useEffect(() => {
    if (value?.dueDate) {
      const date = new Date(value.dueDate);
      setSelectedDate(date);
      setSelectedHour(date.getHours());
      setSelectedMinute(date.getMinutes());
    } else {
      setSelectedDate(undefined);
    }

    setIncludeTime(value?.isAllDay !== undefined ? !value.isAllDay : false);
    setRecurrenceValue(value?.recurrence ? JSON.stringify(value.recurrence) : '__none__');
  }, [value]);

  // 智能推导重复选项（始终显示，使用今天作为默认日期）
  const recurrenceOptions = useMemo(() => {
    const baseDate = selectedDate || getTodayDate();
    return generateRecurrenceOptions(baseDate);
  }, [selectedDate]);

  // 处理快捷按钮点击
  const handleQuickDate = (date: Date) => {
    setSelectedDate(date);
    // 快捷按钮也重置重复选项
    setRecurrenceValue('__none__');
    updateValue(date, includeTime, '__none__');
  };

  // 处理清除日期
  const handleClearDate = () => {
    setSelectedDate(undefined);
    setRecurrenceValue('__none__');
    onChange({});
    setOpen(false);
  };

  // 处理日历选择
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    // 当日期改变时，重置重复选项为"不重复"
    setRecurrenceValue('__none__');
    if (date) {
      updateValue(date, includeTime, '__none__');
    }
  };

  // 处理时间开关
  const handleTimeToggle = (checked: boolean) => {
    setIncludeTime(checked);
    if (selectedDate) {
      updateValue(selectedDate, checked, recurrenceValue);
    }
  };

  // 处理时间选择
  const handleTimeChange = (hour?: number, minute?: number) => {
    const newHour = hour ?? selectedHour;
    const newMinute = minute ?? selectedMinute;
    setSelectedHour(newHour);
    setSelectedMinute(newMinute);
    if (selectedDate) {
      updateValue(selectedDate, includeTime, recurrenceValue, newHour, newMinute);
    }
  };

  // 处理重复规则选择
  const handleRecurrenceChange = (value: string) => {
    setRecurrenceValue(value);
    if (selectedDate) {
      updateValue(selectedDate, includeTime, value);
    }
  };

  // 更新值的统一方法
  const updateValue = (
    date: Date,
    withTime: boolean,
    recurrence: string,
    hour = selectedHour,
    minute = selectedMinute
  ) => {
    // 构建本地时间字符串（不进行时区转换）
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    let dateTimeString: string;
    if (withTime) {
      const hourStr = String(hour).padStart(2, '0');
      const minuteStr = String(minute).padStart(2, '0');
      dateTimeString = `${year}-${month}-${day}T${hourStr}:${minuteStr}:00.000+08:00`;
    } else {
      dateTimeString = `${year}-${month}-${day}T00:00:00.000+08:00`;
    }

    // 处理特殊值 __none__
    const hasRecurrence = recurrence && recurrence !== '__none__';

    onChange({
      dueDate: dateTimeString, // 重复任务也需要 dueDate 作为基准时间
      isAllDay: !withTime,
      recurrence: hasRecurrence ? JSON.parse(recurrence) : undefined,
    });
  };

  // 生成小时选项（0-23）
  const hourOptions = Array.from({ length: 24 }, (_, i) => i);

  // 生成分钟选项（0, 15, 30, 45）
  const minuteOptions = [0, 15, 30, 45];

  // 显示文本
  const displayText = useMemo(() => {
    if (value?.recurrence) {
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const rule = value.recurrence;
      let text = '';

      if (rule.type === 'DAILY') {
        text = '每天';
      } else if (rule.type === 'WEEKLY' && rule.daysOfWeek?.[0] !== undefined) {
        text = `每${weekdays[rule.daysOfWeek[0]]}`;
      } else if (rule.type === 'MONTHLY' && rule.dayOfMonth) {
        text = `每月${rule.dayOfMonth}日`;
      } else {
        text = '重复';
      }

      // 如果有时间且不是全天任务，添加时间显示
      if (value.dueDate && !(value.isAllDay ?? true)) {
        const date = new Date(value.dueDate);
        const timeStr = date.toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        text += ` ${timeStr}`;
      }

      return text;
    }
    if (value?.dueDate) {
      return formatTaskDate(value.dueDate, value.isAllDay ?? true);
    }
    return '设置日期';
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayText}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="flex flex-col space-y-3 p-3">
          {/* 快捷按钮区 - 移除 X 按钮 */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickDate(getTodayDate())}
            >
              今天
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickDate(getTomorrowDate())}
            >
              明天
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickDate(getNextMondayDate())}
            >
              下周一
            </Button>
          </div>

          {/* 日历选择器 */}
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            locale={zhCN}
            initialFocus
          />

          {/* 时间开关 - 始终显示 */}
          <div className="flex items-center justify-between space-x-2 border-t pt-3">
            <Label htmlFor="include-time" className="text-sm">
              包含时间
            </Label>
            <Switch
              id="include-time"
              checked={includeTime}
              onCheckedChange={handleTimeToggle}
            />
          </div>

          {/* 时间选择器 */}
          {selectedDate && includeTime && (
            <div className="flex gap-2 items-center">
              <Select
                value={selectedHour.toString()}
                onValueChange={(v) => handleTimeChange(parseInt(v), undefined)}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hourOptions.map((hour) => (
                    <SelectItem key={hour} value={hour.toString()}>
                      {hour.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>:</span>
              <Select
                value={selectedMinute.toString()}
                onValueChange={(v) => handleTimeChange(undefined, parseInt(v))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {minuteOptions.map((minute) => (
                    <SelectItem key={minute} value={minute.toString()}>
                      {minute.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* 重复规则选择器 - 始终显示 */}
          <div className="border-t pt-3">
            <Label className="text-sm mb-2 block">重复</Label>
            <Select value={recurrenceValue} onValueChange={handleRecurrenceChange}>
              <SelectTrigger>
                <SelectValue placeholder="不重复" />
              </SelectTrigger>
              <SelectContent>
                {recurrenceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 底部按钮区 */}
          <div className="border-t pt-3 flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleClearDate}
            >
              清除
            </Button>
            <Button
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              确定
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
