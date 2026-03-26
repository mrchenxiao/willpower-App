import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  ScrollView,
} from 'react-native';
import {
  Text,
  IconButton,
  FAB,
  Card,
  useTheme,
  Modal,
  Portal,
  Button,
  TextInput,
  Avatar,
  ProgressBar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';

import { useHabitStore } from '../stores/todoStore';
import { HabitRecord, Achievement, AchievementType } from '../types';
import { achievementNames, achievementColors } from '../theme';
import { HabitRecordService } from '../services/todoService';
import HabitCalendar from '../components/HabitCalendar';

const achievementTypes: { type: AchievementType; name: string; days: number }[] = [
  { type: 'streak_7', name: '坚持一周', days: 7 },
  { type: 'streak_21', name: '习惯养成', days: 21 },
  { type: 'streak_30', name: '月度坚持', days: 30 },
  { type: 'streak_100', name: '百日达人', days: 100 },
];

const HabitScreen: React.FC = () => {
  const theme = useTheme();
  const {
    habits,
    activeHabits,
    records,
    achievements,
    fetchHabits,
    addHabit,
    updateHabit,
    deleteHabit,
    checkIn,
    getRecords,
    getTodayRecords,
    getStreak,
  } = useHabitStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [streak, setStreak] = useState(0);
  const [habitRecords, setHabitRecords] = useState<{ [key: string]: boolean }>({});
  const [selectedHabitRecords, setSelectedHabitRecords] = useState<HabitRecord[]>([]);
  const [checkInDates, setCheckInDates] = useState<Set<string>>(new Set());
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // 表单状态
  const [title, setTitle] = useState('');
  const [cycleDays, setCycleDays] = useState('21');

  useEffect(() => {
    fetchHabits();
    getTodayRecords();
  }, [fetchHabits, getTodayRecords]);

  useEffect(() => {
    // 构建今日打卡记录映射
    const recordMap: { [key: string]: boolean } = {};
    records.forEach(r => {
      recordMap[r.habitId] = r.isCompleted;
    });
    setHabitRecords(recordMap);
  }, [records]);

  const resetForm = () => {
    setTitle('');
    setCycleDays('21');
  };

  const handleAddHabit = async () => {
    if (!title.trim()) {
      Alert.alert('提示', '请输入习惯名称');
      return;
    }

    const days = parseInt(cycleDays, 10);
    if (isNaN(days) || days < 21) {
      Alert.alert('提示', '周期最少为21天');
      return;
    }

    await addHabit({
      title: title.trim(),
      cycleDays: days,
      startDate: new Date(),
      isActive: true,
    });

    resetForm();
    setModalVisible(false);
  };

  const handleCheckIn = async (habitId: string) => {
    const newAchievements = await checkIn(habitId);
    if (newAchievements.length > 0) {
      const names = newAchievements.map(a => achievementNames[a.type]).join('、');
      Alert.alert('🎉 恭喜！', `您获得了成就勋章：${names}`);
    }
    // 更新今日打卡状态
    setHabitRecords(prev => ({ ...prev, [habitId]: true }));
  };

  const handleDeleteHabit = (habit: typeof habits[0]) => {
    Alert.alert(
      '确认删除',
      `确定要删除"${habit.title}"吗？所有打卡记录都会被删除。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => deleteHabit(habit.id),
        },
      ]
    );
  };

  const handleStopHabit = async (habit: typeof habits[0]) => {
    Alert.alert(
      '停止习惯',
      `确定要停止"${habit.title}"吗？历史记录会保留。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '停止',
          onPress: async () => {
            await updateHabit(habit.id, { isActive: false });
          },
        },
      ]
    );
  };

  const handleResetHabit = async (habit: typeof habits[0]) => {
    Alert.alert(
      '重置习惯',
      `确定要重置"${habit.title}"吗？所有打卡记录会被清空。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '重置',
          style: 'destructive',
          onPress: async () => {
            await updateHabit(habit.id, {
              startDate: new Date(),
            });
            if (selectedHabit?.id === habit.id) {
              setSelectedHabitRecords([]);
              setCheckInDates(new Set());
            }
          },
        },
      ]
    );
  };

  const openDetailModal = async (habit: typeof habits[0]) => {
    setSelectedHabit(habit);
    const currentStreak = await getStreak(habit.id);
    setStreak(currentStreak);

    // 获取打卡记录
    const habitRecs = await HabitRecordService.getByHabit(habit.id);
    setSelectedHabitRecords(habitRecs);

    // 构建打卡日期集合
    const dates = new Set<string>();
    habitRecs.forEach(r => {
      if (r.isCompleted) {
        dates.add(format(new Date(r.date), 'yyyy-MM-dd'));
      }
    });
    setCheckInDates(dates);

    setCalendarMonth(new Date());
    setDetailModalVisible(true);
  };

  const getProgress = () => {
    if (!selectedHabit) return 0;
    return Math.min(streak / selectedHabit.cycleDays, 1);
  };

  const isTodayCompleted = (habitId: string) => habitRecords[habitId] || false;

  const renderHabitItem = ({ item }: { item: typeof habits[0] }) => {
    const completed = isTodayCompleted(item.id);

    return (
      <Card
        style={[
          styles.habitCard,
          { backgroundColor: theme.colors.surfaceVariant },
          completed && styles.completedCard,
        ]}
        onPress={() => openDetailModal(item)}
      >
        <View style={styles.habitContent}>
          <View style={styles.habitInfo}>
            <Text variant="titleMedium" style={styles.habitTitle}>
              {item.title}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
              目标: {item.cycleDays}天
            </Text>
          </View>
          <View style={styles.habitActions}>
            <IconButton
              icon={completed ? 'check-circle' : 'circle-outline'}
              iconColor={completed ? theme.colors.primary : theme.colors.outline}
              size={32}
              onPress={() => !completed && handleCheckIn(item.id)}
              disabled={completed}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={() => handleDeleteHabit(item)}
            />
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 习惯列表 */}
      <FlatList
        data={activeHabits}
        keyExtractor={item => item.id}
        renderItem={renderHabitItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge" style={{ color: theme.colors.outline }}>
              暂无习惯，开始养成一个好习惯吧
            </Text>
          </View>
        }
      />

      {/* 添加按钮 */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
        color={theme.colors.onPrimary}
      />

      {/* 新建习惯弹窗 */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            新建习惯
          </Text>

          <TextInput
            label="习惯名称"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            mode="outlined"
            placeholder="例如：每天读书30分钟"
          />

          <TextInput
            label="周期天数"
            value={cycleDays}
            onChangeText={setCycleDays}
            style={styles.input}
            mode="outlined"
            keyboardType="number-pad"
            right={<TextInput.Affix text="天（最少21天）" />}
          />

          <View style={styles.modalActions}>
            <Button onPress={() => setModalVisible(false)} style={styles.actionButton}>
              取消
            </Button>
            <Button mode="contained" onPress={handleAddHabit} style={styles.actionButton}>
              创建
            </Button>
          </View>
        </Modal>

        {/* 习惯详情弹窗 */}
        <Modal
          visible={detailModalVisible}
          onDismiss={() => setDetailModalVisible(false)}
          contentContainerStyle={[
            styles.detailModalContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <ScrollView>
            {selectedHabit && (
              <>
                <Text variant="titleLarge" style={styles.modalTitle}>
                  {selectedHabit.title}
                </Text>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
                      {streak}
                    </Text>
                    <Text variant="bodySmall">连续打卡</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
                      {selectedHabit.cycleDays}
                    </Text>
                    <Text variant="bodySmall">目标天数</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
                      {checkInDates.size}
                    </Text>
                    <Text variant="bodySmall">累计打卡</Text>
                  </View>
                </View>

                <View style={styles.progressSection}>
                  <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
                    完成进度
                  </Text>
                  <ProgressBar
                    progress={getProgress()}
                    color={theme.colors.primary}
                    style={styles.progressBar}
                  />
                  <Text variant="bodySmall" style={{ color: theme.colors.outline, marginTop: 4 }}>
                    {Math.round(getProgress() * 100)}%
                  </Text>
                </View>

                {/* 打卡日历 */}
                <HabitCalendar
                  currentMonth={calendarMonth}
                  onMonthChange={setCalendarMonth}
                  checkInDates={checkInDates}
                  startDate={new Date(selectedHabit.startDate)}
                />

                {/* 成就勋章 */}
                <View style={styles.achievementsSection}>
                  <Text variant="bodyMedium" style={{ marginBottom: 12 }}>
                    成就勋章
                  </Text>
                  <View style={styles.achievementsGrid}>
                    {achievementTypes.map(ach => {
                      const earned = achievements.some(
                        a => a.habitId === selectedHabit.id && a.type === ach.type
                      );
                      return (
                        <View
                          key={ach.type}
                          style={[
                            styles.achievementBadge,
                            {
                              backgroundColor: earned
                                ? achievementColors[ach.type]
                                : theme.colors.surfaceVariant,
                              opacity: earned ? 1 : 0.4,
                            },
                          ]}
                        >
                          <Avatar.Icon
                            size={40}
                            icon="medal"
                            style={{ backgroundColor: 'transparent' }}
                            color={earned ? '#FFFFFF' : theme.colors.outline}
                          />
                          <Text
                            variant="labelSmall"
                            style={{ color: earned ? '#FFFFFF' : theme.colors.outline }}
                          >
                            {ach.name}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.detailActions}>
                  <Button
                    mode="outlined"
                    onPress={() => handleStopHabit(selectedHabit)}
                    style={styles.detailButton}
                  >
                    停止习惯
                  </Button>
                  <Button
                    mode="outlined"
                    textColor={theme.colors.error}
                    onPress={() => handleResetHabit(selectedHabit)}
                    style={styles.detailButton}
                  >
                    重置
                  </Button>
                </View>
              </>
            )}
          </ScrollView>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  habitCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  completedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  habitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontWeight: '500',
    marginBottom: 4,
  },
  habitActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 28,
  },
  modalContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  detailModalContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    maxHeight: '85%',
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    minWidth: 80,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  progressSection: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  achievementsSection: {
    marginBottom: 24,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementBadge: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    width: '45%',
  },
  detailActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  detailButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default HabitScreen;