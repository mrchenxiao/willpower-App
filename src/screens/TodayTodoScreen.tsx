import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import {
  Text,
  IconButton,
  FAB,
  Checkbox,
  Card,
  Divider,
  useTheme,
  Modal,
  Portal,
  Button,
  TextInput,
  Switch,
  Dialog,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, subDays } from 'date-fns';

import { useTodoStore } from '../stores/todoStore';
import { Todo, TodoSource } from '../types';
import { TodoService } from '../services/todoService';
import { checkAndSyncPlans } from '../services/planSyncService';
import CalendarView from '../components/CalendarView';

const TodayTodoScreen: React.FC = () => {
  const theme = useTheme();
  const { todos, loading, fetchTodos, addTodo, updateTodo, deleteTodo, toggleComplete } = useTodoStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [completedDates, setCompletedDates] = useState<Set<string>>(new Set());

  // 未完成待办同步提示
  const [syncDialogVisible, setSyncDialogVisible] = useState(false);
  const [incompleteTodos, setIncompleteTodos] = useState<Todo[]>([]);

  // 表单状态
  const [title, setTitle] = useState('');
  const [datetime, setDatetime] = useState(new Date());
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(new Date());
  const [reminderMessage, setReminderMessage] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showReminderTimePicker, setShowReminderTimePicker] = useState(false);

  // 初始化：同步计划、检查未完成待办
  useEffect(() => {
    const init = async () => {
      // 同步计划到今日待办
      await checkAndSyncPlans();
      // 加载今日待办
      fetchTodos(selectedDate);
      // 获取已完成日期（用于日历标记）
      loadCompletedDates();
      // 检查昨天是否有未完成待办
      checkIncompleteTodos();
    };
    init();
  }, []);

  // 检查昨天未完成待办
  const checkIncompleteTodos = async () => {
    const yesterday = subDays(new Date(), 1);
    const incomplete = await TodoService.getIncompleteByDate(yesterday);
    if (incomplete.length > 0) {
      setIncompleteTodos(incomplete);
      setSyncDialogVisible(true);
    }
  };

  // 加载有完成记录的日期
  const loadCompletedDates = async () => {
    const dates = new Set<string>();
    // 获取最近30天的完成情况
    for (let i = 0; i < 30; i++) {
      const date = subDays(new Date(), i);
      const todos = await TodoService.getByDate(date);
      const allCompleted = todos.length > 0 && todos.every(t => t.isCompleted);
      if (allCompleted) {
        dates.add(format(date, 'yyyy-MM-dd'));
      }
    }
    setCompletedDates(dates);
  };

  useEffect(() => {
    fetchTodos(selectedDate);
  }, [selectedDate, fetchTodos]);

  // 同步未完成待办到今天
  const handleSyncIncomplete = async () => {
    const today = new Date();
    for (const todo of incompleteTodos) {
      await TodoService.create({
        title: todo.title,
        datetime: new Date(),
        reminderEnabled: todo.reminderEnabled,
        reminderTime: todo.reminderTime ? new Date(todo.reminderTime) : undefined,
        reminderMessage: todo.reminderMessage,
        isCompleted: false,
        date: today,
        source: todo.source,
        planId: todo.planId,
      });
    }
    setSyncDialogVisible(false);
    fetchTodos(today);
    setSelectedDate(today);
  };

  const resetForm = () => {
    setTitle('');
    setDatetime(new Date());
    setReminderEnabled(false);
    setReminderTime(new Date());
    setReminderMessage('');
  };

  const handleAddTodo = async () => {
    if (!title.trim()) {
      Alert.alert('提示', '请输入待办标题');
      return;
    }

    await addTodo({
      title: title.trim(),
      datetime,
      reminderEnabled,
      reminderTime: reminderEnabled ? reminderTime : undefined,
      reminderMessage: reminderEnabled && reminderMessage.trim() ? reminderMessage.trim() : undefined,
      isCompleted: false,
      date: selectedDate,
      source: 'manual' as TodoSource,
    });

    resetForm();
    setModalVisible(false);
    loadCompletedDates();
  };

  const handleEditTodo = async () => {
    if (!editingTodo || !title.trim()) {
      Alert.alert('提示', '请输入待办标题');
      return;
    }

    await updateTodo(editingTodo.id, {
      title: title.trim(),
      datetime,
      reminderEnabled,
      reminderTime: reminderEnabled ? reminderTime : undefined,
      reminderMessage: reminderEnabled && reminderMessage.trim() ? reminderMessage.trim() : undefined,
    });

    resetForm();
    setEditingTodo(null);
    setEditModalVisible(false);
    loadCompletedDates();
  };

  const handleDeleteTodo = (todo: Todo) => {
    Alert.alert(
      '确认删除',
      `确定要删除"${todo.title}"吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            await deleteTodo(todo.id);
            loadCompletedDates();
          },
        },
      ]
    );
  };

  const openEditModal = (todo: Todo) => {
    setEditingTodo(todo);
    setTitle(todo.title);
    setDatetime(new Date(todo.datetime));
    setReminderEnabled(todo.reminderEnabled);
    if (todo.reminderTime) setReminderTime(new Date(todo.reminderTime));
    setReminderMessage(todo.reminderMessage || '');
    setEditModalVisible(true);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return '今天';
    if (date.toDateString() === yesterday.toDateString()) return '昨天';
    return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  const handleToggleComplete = async (id: string) => {
    await toggleComplete(id);
    loadCompletedDates();
  };

  const renderTodoItem = ({ item }: { item: Todo }) => (
    <Card
      style={[
        styles.todoCard,
        { backgroundColor: theme.colors.surfaceVariant },
        item.isCompleted && styles.completedCard,
      ]}
    >
      <View style={styles.todoContent}>
        <Checkbox
          status={item.isCompleted ? 'checked' : 'unchecked'}
          onPress={() => handleToggleComplete(item.id)}
          color={theme.colors.primary}
        />
        <View style={styles.todoText}>
          <Text
            variant="titleMedium"
            style={[
              styles.todoTitle,
              item.isCompleted && styles.completedText,
            ]}
          >
            {item.title}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
            {formatTime(new Date(item.datetime))}
            {item.reminderEnabled && '  🔔'}
            {item.source === 'plan' && '  📋 来自计划'}
          </Text>
        </View>
        <View style={styles.todoActions}>
          {!item.isCompleted && (
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => openEditModal(item)}
            />
          )}
          <IconButton
            icon="delete"
            size={20}
            onPress={() => handleDeleteTodo(item)}
          />
        </View>
      </View>
    </Card>
  );

  const TodoFormModal = ({ visible, onDismiss, onSubmit }: {
    visible: boolean;
    onDismiss: () => void;
    onSubmit: () => void;
  }) => (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
    >
      <Text variant="titleLarge" style={styles.modalTitle}>
        {editingTodo ? '编辑待办' : '新建待办'}
      </Text>

      <TextInput
        label="待办标题"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        mode="outlined"
      />

      <View style={styles.row}>
        <Button
          mode="outlined"
          onPress={() => setShowDatePicker(true)}
          style={styles.dateButton}
        >
          {datetime.toLocaleDateString('zh-CN')}
        </Button>
        <Button
          mode="outlined"
          onPress={() => setShowTimePicker(true)}
          style={styles.dateButton}
        >
          {formatTime(datetime)}
        </Button>
      </View>

      <View style={styles.reminderRow}>
        <Text variant="bodyMedium">开启提醒</Text>
        <Switch
          value={reminderEnabled}
          onValueChange={setReminderEnabled}
        />
      </View>

      {reminderEnabled && (
        <>
          <Button
            mode="outlined"
            onPress={() => setShowReminderTimePicker(true)}
            style={styles.dateButton}
          >
            提醒时间: {formatTime(reminderTime)}
          </Button>

          <TextInput
            label="自定义提醒话术（可选）"
            value={reminderMessage}
            onChangeText={setReminderMessage}
            style={styles.input}
            mode="outlined"
            placeholder="不填写则使用默认提醒文案"
          />
        </>
      )}

      <View style={styles.modalActions}>
        <Button onPress={onDismiss} style={styles.actionButton}>
          取消
        </Button>
        <Button
          mode="contained"
          onPress={onSubmit}
          style={styles.actionButton}
        >
          保存
        </Button>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 日历视图（可展开） */}
      {calendarVisible && (
        <CalendarView
          currentDate={currentMonth}
          selectedDate={selectedDate}
          onDateSelect={(date) => {
            setSelectedDate(date);
            setCalendarVisible(false);
          }}
          onMonthChange={setCurrentMonth}
          completedDates={completedDates}
        />
      )}

      {/* 日期选择器 */}
      <View style={[styles.dateHeader, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          onPress={() => {
            const prev = new Date(selectedDate);
            prev.setDate(prev.getDate() - 1);
            setSelectedDate(prev);
          }}
        >
          <IconButton icon="chevron-left" size={24} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCalendarVisible(!calendarVisible)}>
          <View style={styles.dateDisplay}>
            <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
              {formatDate(selectedDate)}
            </Text>
            <IconButton
              icon={calendarVisible ? "chevron-up" : "chevron-down"}
              size={20}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            const next = new Date(selectedDate);
            next.setDate(next.getDate() + 1);
            setSelectedDate(next);
          }}
        >
          <IconButton icon="chevron-right" size={24} />
        </TouchableOpacity>
      </View>

      <Divider />

      {/* 待办列表 */}
      <FlatList
        data={todos}
        keyExtractor={item => item.id}
        renderItem={renderTodoItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          todos.length > 0 ? (
            <View style={styles.statsRow}>
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                完成 {todos.filter(t => t.isCompleted).length}/{todos.length}
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge" style={{ color: theme.colors.outline }}>
              暂无待办事项
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

      {/* 弹窗 */}
      <Portal>
        <TodoFormModal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          onSubmit={handleAddTodo}
        />
        <TodoFormModal
          visible={editModalVisible}
          onDismiss={() => {
            setEditModalVisible(false);
            setEditingTodo(null);
            resetForm();
          }}
          onSubmit={handleEditTodo}
        />

        {/* 未完成待办同步提示 */}
        <Dialog
          visible={syncDialogVisible}
          onDismiss={() => setSyncDialogVisible(false)}
        >
          <Dialog.Title>未完成待办</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              昨天有 {incompleteTodos.length} 个待办未完成，是否同步到今天？
            </Text>
            <ScrollView style={{ maxHeight: 200, marginTop: 12 }}>
              {incompleteTodos.map(todo => (
                <Text key={todo.id} variant="bodySmall" style={{ marginBottom: 4 }}>
                  • {todo.title}
                </Text>
              ))}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSyncDialogVisible(false)}>不同步</Button>
            <Button onPress={handleSyncIncomplete}>同步到今天</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* 日期选择器 */}
      {showDatePicker && (
        <DateTimePicker
          value={datetime}
          mode="date"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setDatetime(date);
          }}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={datetime}
          mode="time"
          onChange={(event, date) => {
            setShowTimePicker(false);
            if (date) {
              const newDate = new Date(datetime);
              newDate.setHours(date.getHours(), date.getMinutes());
              setDatetime(newDate);
            }
          }}
        />
      )}
      {showReminderTimePicker && (
        <DateTimePicker
          value={reminderTime}
          mode="time"
          onChange={(event, date) => {
            setShowReminderTimePicker(false);
            if (date) setReminderTime(date);
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsRow: {
    marginBottom: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  todoCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  completedCard: {
    opacity: 0.6,
  },
  todoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  todoText: {
    flex: 1,
    marginLeft: 8,
  },
  todoTitle: {
    fontWeight: '500',
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  todoActions: {
    flexDirection: 'row',
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
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  dateButton: {
    flex: 1,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
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
});

export default TodayTodoScreen;