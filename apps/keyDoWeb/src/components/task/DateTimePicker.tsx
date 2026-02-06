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
  parseDateInUTC8,
  getDateStringInUTC8,
} from '@/utils/dateUtils';

interface DateTimePickerProps {
  value?: {
    dueDate?: string;      // YYYY-MM-DD 格式
    dueTime?: string;      // HH:mm 格式
    recurrence?: RecurrenceRule;
  };
  onChange: (value: {
    dueDate?: string;
    dueTime?: string;
    recurrence?: RecurrenceRule;
  }) => void;
}

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    value?.dueDate ? parseDateInUTC8(value.dueDate, value?.dueTime ?? '00:00') : undefined
  );
  // 是否包含时间（通过 dueTime 是否存在判断）
  const [includeTime, setIncludeTime] = useState(!!value?.dueTime);
  
  // 从 dueTime 解析时分
  const [selectedHour, setSelectedHour] = useState(() => {
    if (value?.dueTime) {
      return parseInt(value.dueTime.split(':')[0], 10);
    }
    return 9;
  });
  const [selectedMinute, setSelectedMinute] = useState(() => {
    if (value?.dueTime) {
      return parseInt(value.dueTime.split(':')[1], 10);
    }
    return 0;
  });
  
  const [recurrenceValue, setRecurrenceValue] = useState(
    value?.recurrence ? JSON.stringify(value.recurrence) : '__none__'
  );

  // 当 value prop 改变时，同步内部状态（按东八区解析）
  useEffect(() => {
    if (value?.dueDate) {
      setSelectedDate(parseDateInUTC8(value.dueDate, value?.dueTime ?? '00:00'));
    } else {
      setSelectedDate(undefined);
    }

    if (value?.dueTime) {
      const [hour, minute] = value.dueTime.split(':').map(v => parseInt(v, 10));
      setSelectedHour(hour);
      setSelectedMinute(minute);
      setIncludeTime(true);
    } else {
      setIncludeTime(false);
    }

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

  // 更新值的统一方法（按东八区输出日期）
  const updateValue = (
    date: Date,
    withTime: boolean,
    recurrence: string,
    hour = selectedHour,
    minute = selectedMinute
  ) => {
    const dateString = getDateStringInUTC8(date);

    // 格式化时间为 HH:mm（仅当包含时间时）
    const timeString = withTime
      ? `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      : undefined;

    // 处理特殊值 __none__
    const hasRecurrence = recurrence && recurrence !== '__none__';

    onChange({
      dueDate: dateString,
      dueTime: timeString,
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

      // 如果有时间，添加时间显示
      if (value.dueTime) {
        text += ` ${value.dueTime}`;
      }

      return text;
    }
    if (value?.dueDate) {
      return formatTaskDate(value.dueDate, value.dueTime);
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
