import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import TodayTodoScreen from '../screens/TodayTodoScreen';
import PlanScreen from '../screens/PlanScreen';
import HabitScreen from '../screens/HabitScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  const theme = useTheme();

  return (
    <NavigationContainer
      theme={{
        dark: theme.dark,
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.onSurface,
          border: theme.colors.outline,
          notification: theme.colors.error,
        },
      }}
    >
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: string;

            switch (route.name) {
              case 'TodayTodo':
                iconName = focused ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline';
                break;
              case 'Plan':
                iconName = focused ? 'calendar-check' : 'calendar-outline';
                break;
              case 'Habit':
                iconName = focused ? 'star' : 'star-outline';
                break;
              default:
                iconName = 'circle';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.outline,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.outlineVariant,
          },
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerTitleStyle: {
            color: theme.colors.onSurface,
          },
        })}
      >
        <Tab.Screen
          name="TodayTodo"
          component={TodayTodoScreen}
          options={{ title: '今日待办', headerTitle: '今日待办' }}
        />
        <Tab.Screen
          name="Plan"
          component={PlanScreen}
          options={{ title: '长期计划', headerTitle: '长期计划' }}
        />
        <Tab.Screen
          name="Habit"
          component={HabitScreen}
          options={{ title: '习惯养成', headerTitle: '习惯养成' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;