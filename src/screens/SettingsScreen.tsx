import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import {
  Text,
  List,
  Switch,
  Divider,
  useTheme,
  Dialog,
  Portal,
  Button,
  TextInput,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeStore } from '../stores/todoStore';
import { ThemeMode } from '../types';
import { aiService } from '../services/aiService';

const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const { mode, setMode } = useThemeStore();

  const [aiDialogVisible, setAiDialogVisible] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [aiEnabled, setAiEnabled] = useState(false);

  useEffect(() => {
    checkAIConfig();
  }, []);

  const checkAIConfig = async () => {
    const configured = await aiService.isConfigured();
    setAiEnabled(configured);
  };

  const handleThemeChange = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  const handleAIConfig = async () => {
    if (apiKey.trim()) {
      await aiService.configure({ apiKey: apiKey.trim() });
      setAiEnabled(true);
      setAiDialogVisible(false);
      Alert.alert('成功', 'AI功能已启用');
    } else {
      Alert.alert('提示', '请输入API Key');
    }
  };

  const openNotificationSettings = () => {
    Alert.alert(
      '通知权限',
      '请在系统设置中允许Willpower发送通知',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '去设置',
          onPress: () => {
            Linking.openSettings();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        {/* 主题设置 */}
        <List.Section>
          <List.Subheader>外观</List.Subheader>
          <List.Item
            title="主题模式"
            description={
              mode === 'system'
                ? '跟随系统'
                : mode === 'dark'
                ? '深色模式'
                : '浅色模式'
            }
            left={props => <List.Icon {...props} icon="theme-light-dark" />}
          />
          <View style={styles.themeOptions}>
            <TouchableOpacity
              style={[
                styles.themeOption,
                mode === 'system' && {
                  backgroundColor: theme.colors.primaryContainer,
                },
              ]}
              onPress={() => handleThemeChange('system')}
            >
              <Text
                style={{
                  color:
                    mode === 'system'
                      ? theme.colors.onPrimaryContainer
                      : theme.colors.onSurface,
                }}
              >
                跟随系统
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.themeOption,
                mode === 'light' && {
                  backgroundColor: theme.colors.primaryContainer,
                },
              ]}
              onPress={() => handleThemeChange('light')}
            >
              <Text
                style={{
                  color:
                    mode === 'light'
                      ? theme.colors.onPrimaryContainer
                      : theme.colors.onSurface,
                }}
              >
                浅色
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.themeOption,
                mode === 'dark' && {
                  backgroundColor: theme.colors.primaryContainer,
                },
              ]}
              onPress={() => handleThemeChange('dark')}
            >
              <Text
                style={{
                  color:
                    mode === 'dark'
                      ? theme.colors.onPrimaryContainer
                      : theme.colors.onSurface,
                }}
              >
                深色
              </Text>
            </TouchableOpacity>
          </View>
        </List.Section>

        <Divider />

        {/* 通知设置 */}
        <List.Section>
          <List.Subheader>通知</List.Subheader>
          <List.Item
            title="通知权限"
            description="管理应用通知权限"
            left={props => <List.Icon {...props} icon="bell" />}
            onPress={openNotificationSettings}
          />
        </List.Section>

        <Divider />

        {/* AI功能 */}
        <List.Section>
          <List.Subheader>AI功能（实验性）</List.Subheader>
          <List.Item
            title="AI智能助手"
            description={
              aiEnabled
                ? '已启用 - 智能提醒话术、计划建议、每日总结'
                : '未配置 - 启用后可获得智能功能'
            }
            left={props => <List.Icon {...props} icon="robot" />}
            right={props => (
              <Switch
                value={aiEnabled}
                onValueChange={() => {
                  if (aiEnabled) {
                    Alert.alert(
                      '禁用AI',
                      '确定要禁用AI功能吗？',
                      [
                        { text: '取消', style: 'cancel' },
                        {
                          text: '禁用',
                          onPress: async () => {
                            await aiService.configure({ apiKey: undefined });
                            setAiEnabled(false);
                          },
                        },
                      ]
                    );
                  } else {
                    setAiDialogVisible(true);
                  }
                }}
              />
            )}
          />
        </List.Section>

        <Divider />

        {/* 关于 */}
        <List.Section>
          <List.Subheader>关于</List.Subheader>
          <List.Item
            title="版本"
            description="1.0.0"
            left={props => <List.Icon {...props} icon="information" />}
          />
          <List.Item
            title="开发者"
            description="Willpower Team"
            left={props => <List.Icon {...props} icon="account" />}
          />
        </List.Section>
      </ScrollView>

      {/* AI配置弹窗 */}
      <Portal>
        <Dialog
          visible={aiDialogVisible}
          onDismiss={() => setAiDialogVisible(false)}
        >
          <Dialog.Title>配置AI功能</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="API Key"
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry
              mode="outlined"
              placeholder="输入您的AI服务API Key"
            />
            <Text variant="bodySmall" style={{ marginTop: 12, color: theme.colors.outline }}>
              您的API Key将被安全存储在设备本地，不会上传到任何服务器。
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAiDialogVisible(false)}>取消</Button>
            <Button onPress={handleAIConfig}>确认</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  themeOptions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  themeOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
});

export default SettingsScreen;