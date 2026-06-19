import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import { getMonthDays, isSameMonth, formatDate } from '@/utils/date';

interface CalendarViewProps {
  selectedDate?: string;
  onSelect?: (date: string) => void;
  courseDates?: string[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ selectedDate, onSelect, courseDates = [] }) => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selected, setSelected] = useState<string>(selectedDate || formatDate(new Date().toISOString()));

  const todayStr = formatDate(new Date().toISOString());
  const weekdayNames = ['日', '一', '二', '三', '四', '五', '六'];

  const days = useMemo(() => {
    return getMonthDays(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleSelectDate = (date: string) => {
    setSelected(date);
    onSelect?.(date);
  };

  const hasCourseOnDate = (date: string): boolean => {
    return courseDates.includes(date);
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <View className={styles.navBtn} onClick={handlePrevMonth}>‹</View>
        <View className={styles.monthText}>{currentYear}年{currentMonth + 1}月</View>
        <View className={styles.navBtn} onClick={handleNextMonth}>›</View>
      </View>

      <View className={styles.weekdays}>
        {weekdayNames.map((name, idx) => (
          <View
            key={idx}
            className={`${styles.weekdayText} ${(idx === 0 || idx === 6) ? styles.weekend : ''}`}
          >
            {name}
          </View>
        ))}
      </View>

      <View className={styles.daysGrid}>
        {days.map((date, idx) => {
          const dayNum = new Date(date).getDate();
          const isCurrentMonth = isSameMonth(date, `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`);
          const isToday = date === todayStr;
          const isSelected = date === selected;
          const isWeekend = idx % 7 === 0 || idx % 7 === 6;
          const hasCourse = hasCourseOnDate(date);

          return (
            <View
              key={date}
              className={`
                ${styles.dayCell}
                ${!isCurrentMonth ? styles.otherMonth : ''}
                ${isToday ? styles.today : ''}
                ${isSelected ? styles.selected : ''}
                ${isWeekend ? styles.weekendCell : ''}
                ${hasCourse ? styles.hasCourse : ''}
              `}
              onClick={() => handleSelectDate(date)}
            >
              <Text className={styles.dayText}>{dayNum}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default CalendarView;
