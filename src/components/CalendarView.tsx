import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface CalendarViewProps {
  currentDate: Date;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onMonthChange: (date: Date) => void;
  completedDates: Set<string>; // 格式: 'yyyy-MM-dd'
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

const CalendarView: React.FC<CalendarViewProps> = ({
  currentDate,
  selectedDate,
  onDateSelect,
  onMonthChange,
  completedDates,
}) => {
  const theme = useTheme();

  const days = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const monthDays = eachDayOfInterval({ start, end });

    // 补齐第一周空白
    const startPadding = start.getDay();
    const paddedDays: (Date | null)[] = Array(startPadding).fill(null);

    return [...paddedDays, ...monthDays];
  }, [currentDate]);

  const handlePrevMonth = () => {
    onMonthChange(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(addMonths(currentDate, 1));
  };

  const formatDateKey = (date: Date) => format(date, 'yyyy-MM-dd');

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* 月份导航 */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={handlePrevMonth}>
          <Text style={{ color: theme.colors.primary }}>◀</Text>
        </TouchableOpacity>
        <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
          {format(currentDate, 'yyyy年M月', { locale: zhCN })}
        </Text>
        <TouchableOpacity onPress={handleNextMonth}>
          <Text style={{ color: theme.colors.primary }}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* 星期标题 */}
      <View style={styles.weekdays}>
        {WEEKDAYS.map((day, index) => (
          <View key={day} style={styles.weekdayCell}>
            <Text
              variant="labelSmall"
              style={{
                color: index === 0 || index === 6
                  ? theme.colors.error
                  : theme.colors.outline
              }}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* 日期网格 */}
      <View style={styles.daysGrid}>
        {days.map((day, index) => {
          if (!day) {
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }

          const isSelected = isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);
          const isCompleted = completedDates.has(formatDateKey(day));
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;

          return (
            <TouchableOpacity
              key={formatDateKey(day)}
              style={[
                styles.dayCell,
                isSelected && { backgroundColor: theme.colors.primaryContainer },
              ]}
              onPress={() => onDateSelect(day)}
            >
              <View
                style={[
                  styles.dayContent,
                  isTodayDate && { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text
                  variant="bodySmall"
                  style={{
                    color: isTodayDate
                      ? theme.colors.onPrimary
                      : isSelected
                      ? theme.colors.onPrimaryContainer
                      : isWeekend
                      ? theme.colors.error
                      : theme.colors.onSurface,
                  }}
                >
                  {format(day, 'd')}
                </Text>
                {isCompleted && (
                  <View
                    style={[
                      styles.completedDot,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  weekdays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayContent: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 2,
  },
});

export default CalendarView;