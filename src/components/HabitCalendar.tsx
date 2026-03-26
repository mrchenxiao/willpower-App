import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, isBefore, isAfter } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface HabitCalendarProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  checkInDates: Set<string>; // 格式: 'yyyy-MM-dd'
  startDate?: Date;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

const HabitCalendar: React.FC<HabitCalendarProps> = ({
  currentMonth,
  onMonthChange,
  checkInDates,
  startDate,
}) => {
  const theme = useTheme();

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const monthDays = eachDayOfInterval({ start, end });

    // 补齐第一周空白
    const startPadding = start.getDay();
    const paddedDays: (Date | null)[] = Array(startPadding).fill(null);

    return [...paddedDays, ...monthDays];
  }, [currentMonth]);

  const handlePrevMonth = () => {
    onMonthChange(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(addMonths(currentMonth, 1));
  };

  const formatDateKey = (date: Date) => format(date, 'yyyy-MM-dd');

  const isCheckedIn = (date: Date) => checkInDates.has(formatDateKey(date));

  const isWithinRange = (date: Date) => {
    if (!startDate) return true;
    return !isBefore(date, startDate);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* 月份导航 */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={handlePrevMonth}>
          <Text style={{ color: theme.colors.primary }}>◀</Text>
        </TouchableOpacity>
        <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
          {format(currentMonth, 'yyyy年M月', { locale: zhCN })}
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

          const isTodayDate = isToday(day);
          const isChecked = isCheckedIn(day);
          const isInRange = isWithinRange(day);
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;

          return (
            <View key={formatDateKey(day)} style={styles.dayCell}>
              <View
                style={[
                  styles.dayContent,
                  isChecked && { backgroundColor: theme.colors.primary },
                  isTodayDate && !isChecked && { borderWidth: 2, borderColor: theme.colors.primary },
                  !isInRange && { opacity: 0.3 },
                ]}
              >
                <Text
                  variant="bodySmall"
                  style={{
                    color: isChecked
                      ? theme.colors.onPrimary
                      : isTodayDate
                      ? theme.colors.primary
                      : isWeekend
                      ? theme.colors.error
                      : theme.colors.onSurface,
                  }}
                >
                  {format(day, 'd')}
                </Text>
                {isChecked && (
                  <Text variant="labelSmall" style={{ color: theme.colors.onPrimary, fontSize: 8 }}>
                    ✓
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* 图例 */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
          <Text variant="labelSmall" style={{ color: theme.colors.outline }}>已打卡</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { borderWidth: 2, borderColor: theme.colors.primary }]} />
          <Text variant="labelSmall" style={{ color: theme.colors.outline }}>今天</Text>
        </View>
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
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default HabitCalendar;