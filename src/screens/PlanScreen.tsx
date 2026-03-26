import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  IconButton,
  FAB,
  Card,
  Divider,
  useTheme,
  Modal,
  Portal,
  Button,
  TextInput,
  Switch,
  Chip,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

import { usePlanStore } from '../stores/todoStore';
import { Granularity, Plan } from '../types';

const granularityOptions: { value: Granularity; label: string; icon: string }[] = [
  { value: 'day', label: '每日', icon: 'calendar-today' },
  { value: 'week', label: '每周', icon: 'calendar-week' },
  { value: 'month', label: '每月', icon: 'calendar-month' },
  { value: 'year', label: '每年', icon: 'calendar-blank' },
];

const PlanScreen: React.FC = () => {
  const theme = useTheme();
  const {
    plans,
    activePlans,
    fetchPlans,
    addPlan,
    updatePlan,
    deletePlan,
    toggleActive,
  } = usePlanStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [filter, setFilter] = useState<'all' | 'active'>('active');

  // 表单状态
  const [title, setTitle] = useState('');
  const [granularity, setGranularity] = useState<Granularity>('day');
  const [startDate, setStartDate] = useState(new Date());
  const [isActive, setIsActive] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const resetForm = () => {
    setTitle('');
    setGranularity('day');
    setStartDate(new Date());
    setIsActive(true);
  };

  const handleAddPlan = async () => {
    if (!title.trim()) {
      Alert.alert('提示', '请输入计划标题');
      return;
    }

    await addPlan({
      title: title.trim(),
      granularity,
      startDate,
      isActive,
    });

    resetForm();
    setModalVisible(false);
  };

  const handleEditPlan = async () => {
    if (!editingPlan || !title.trim()) {
      Alert.alert('提示', '请输入计划标题');
      return;
    }

    await updatePlan(editingPlan.id, {
      title: title.trim(),
      granularity,
      isActive,
    });

    resetForm();
    setEditingPlan(null);
    setEditModalVisible(false);
  };

  const handleDeletePlan = (plan: Plan) => {
    Alert.alert(
      '确认删除',
      `确定要删除"${plan.title}"吗？关联的未完成待办也会被删除。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => deletePlan(plan.id),
        },
      ]
    );
  };

  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setTitle(plan.title);
    setGranularity(plan.granularity);
    setStartDate(new Date(plan.startDate));
    setIsActive(plan.isActive);
    setEditModalVisible(true);
  };

  const displayPlans = filter === 'active' ? activePlans : plans;

  const renderPlanItem = ({ item }: { item: Plan }) => (
    <Card
      style={[
        styles.planCard,
        { backgroundColor: theme.colors.surfaceVariant },
        !item.isActive && styles.inactiveCard,
      ]}
    >
      <View style={styles.planContent}>
        <View style={styles.planText}>
          <Text variant="titleMedium" style={styles.planTitle}>
            {item.title}
          </Text>
          <View style={styles.planMeta}>
            <Chip
              mode="flat"
              compact
              style={{ backgroundColor: theme.colors.primaryContainer }}
              textStyle={{ color: theme.colors.onPrimaryContainer }}
            >
              {granularityOptions.find(g => g.value === item.granularity)?.label}
            </Chip>
            <Text
              variant="bodySmall"
              style={{ color: item.isActive ? theme.colors.primary : theme.colors.error }}
            >
              {item.isActive ? '进行中' : '已暂停'}
            </Text>
          </View>
        </View>
        <View style={styles.planActions}>
          <Switch
            value={item.isActive}
            onValueChange={() => toggleActive(item.id)}
          />
          <IconButton
            icon="pencil"
            size={20}
            onPress={() => openEditModal(item)}
          />
          <IconButton
            icon="delete"
            size={20}
            onPress={() => handleDeletePlan(item)}
          />
        </View>
      </View>
    </Card>
  );

  const PlanFormModal = ({
    visible,
    onDismiss,
    onSubmit,
  }: {
    visible: boolean;
    onDismiss: () => void;
    onSubmit: () => void;
  }) => (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={[
        styles.modalContainer,
        { backgroundColor: theme.colors.surface },
      ]}
    >
      <Text variant="titleLarge" style={styles.modalTitle}>
        {editingPlan ? '编辑计划' : '新建计划'}
      </Text>

      <TextInput
        label="计划标题"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        mode="outlined"
      />

      <Text variant="bodyMedium" style={styles.label}>
        计划粒度
      </Text>
      <View style={styles.granularityOptions}>
        {granularityOptions.map(option => (
          <Chip
            key={option.value}
            mode={granularity === option.value ? 'flat' : 'outlined'}
            selected={granularity === option.value}
            onPress={() => setGranularity(option.value)}
            style={[
              styles.granularityChip,
              granularity === option.value && {
                backgroundColor: theme.colors.primaryContainer,
              },
            ]}
            textStyle={{
              color:
                granularity === option.value
                  ? theme.colors.onPrimaryContainer
                  : theme.colors.onSurface,
            }}
          >
            {option.label}
          </Chip>
        ))}
      </View>

      <View style={styles.activeRow}>
        <Text variant="bodyMedium">立即生效</Text>
        <Switch value={isActive} onValueChange={setIsActive} />
      </View>

      <View style={styles.modalActions}>
        <Button onPress={onDismiss} style={styles.actionButton}>
          取消
        </Button>
        <Button mode="contained" onPress={onSubmit} style={styles.actionButton}>
          保存
        </Button>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* 筛选器 */}
      <View style={[styles.filterHeader, { backgroundColor: theme.colors.surface }]}>
        <Chip
          mode={filter === 'active' ? 'flat' : 'outlined'}
          selected={filter === 'active'}
          onPress={() => setFilter('active')}
          style={[
            styles.filterChip,
            filter === 'active' && { backgroundColor: theme.colors.primaryContainer },
          ]}
        >
          进行中
        </Chip>
        <Chip
          mode={filter === 'all' ? 'flat' : 'outlined'}
          selected={filter === 'all'}
          onPress={() => setFilter('all')}
          style={[
            styles.filterChip,
            filter === 'all' && { backgroundColor: theme.colors.primaryContainer },
          ]}
        >
          全部
        </Chip>
      </View>

      <Divider />

      {/* 计划列表 */}
      <FlatList
        data={displayPlans}
        keyExtractor={item => item.id}
        renderItem={renderPlanItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge" style={{ color: theme.colors.outline }}>
              暂无计划
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
        <PlanFormModal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          onSubmit={handleAddPlan}
        />
        <PlanFormModal
          visible={editModalVisible}
          onDismiss={() => {
            setEditModalVisible(false);
            setEditingPlan(null);
            resetForm();
          }}
          onSubmit={handleEditPlan}
        />
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  filterChip: {
    marginRight: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  planCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  inactiveCard: {
    opacity: 0.6,
  },
  planContent: {
    padding: 12,
  },
  planText: {
    marginBottom: 8,
  },
  planTitle: {
    fontWeight: '500',
    marginBottom: 8,
  },
  planMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  planActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
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
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  granularityOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  granularityChip: {
    marginRight: 4,
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
});

export default PlanScreen;