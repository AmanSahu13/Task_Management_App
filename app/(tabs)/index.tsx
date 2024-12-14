import { useState, useMemo, useContext } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isToday, isSameWeek } from 'date-fns';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { TaskList } from '@/components/TaskList';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { StatCard } from '@/components/ui/StatCard';
import { AddTaskModal } from '@/components/AddTaskModal';
import { Task } from '@/types/task';

interface TaskStats {
  total: number;
  completed: number;
  dueToday: number;
  dueThisWeek: number;
}

// Temporary mock data - will be replaced with actual data later
const mockStats: TaskStats = {
  total: 12,
  completed: 5,
  dueToday: 3,
  dueThisWeek: 7,
};

interface TaskFilters {
  status?: Task['status'];
  priority?: Task['priority'];
  searchQuery?: string;
}

// Add createStyles function before the HomeScreen component
const createStyles = (themeColors: typeof Colors['light']) => StyleSheet.create({
  container: {
    flex: 1,
  },
  stickyContent: {
    backgroundColor: themeColors.background,
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 1, // Ensure sticky content stays on top
    elevation: 1, // For Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subGreeting: {
    color: '#666666',
  },
  themeToggle: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: themeColors.background,
  },
  avatar: {
    backgroundColor: '#F5F3FF',
    borderRadius: 20,
  },
  statsCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  quickActionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F5F3FF',
    minWidth: 100,
  },
  quickActionButtonSelected: {
    backgroundColor: Colors.light.primary,
  },
  quickActionText: {
    fontWeight: '600',
    textAlign: 'center',
    color: Colors.light.text,
  },
  quickActionTextSelected: {
    color: '#FFFFFF',
  },
  taskSection: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: themeColors.background,
  },
  projectMonth: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 4,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  taskScrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [colorScheme, setColorScheme] = useState(useColorScheme() ?? 'light');
  const themeColors = Colors[colorScheme];
  const styles = createStyles(themeColors);
  const [activeTab, setActiveTab] = useState('My tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<TaskFilters>({});
  const [isAddTaskVisible, setIsAddTaskVisible] = useState(false);

  // Theme toggle function
  const toggleTheme = async () => {
    const newTheme = colorScheme === 'light' ? 'dark' : 'light';
    setColorScheme(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  // Add task management functions
  const addTask = (newTask: Omit<Task, 'id' | 'createdAt'>) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setTasks(prev => [...prev, task]);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  // Filter tasks based on activeTab
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (activeTab === 'In Progress') {
        return task.status === 'In Progress';
      } else if (activeTab === 'Completed') {
        return task.status === 'Completed';
      }
      return true; // Show all tasks in "My Tasks" tab
    });
  }, [tasks, activeTab]);

  // Add calculateProgress function
  const calculateProgress = () => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(task => task.status === 'Completed').length;
    return Math.round((completed / tasks.length) * 100);
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Sticky Header */}
      <View style={[styles.stickyContent, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View>
            <ThemedText style={styles.greeting}>Hello, John!</ThemedText>
            <ThemedText style={styles.subGreeting}>Have a nice day!</ThemedText>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
              <IconSymbol 
                name={colorScheme === 'light' ? 'moon' : 'sun'}
                size={24}
                color={themeColors.text}
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <IconSymbol 
                name="person"
                size={40}
                color={themeColors.tint}
                style={styles.avatar}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsCards}>
          <StatCard
            title="Total Tasks"
            value={tasks.length}
            icon="assignment"
            color={themeColors.primary}
          />
          <StatCard
            title="Completed"
            value={tasks.filter(t => t.status === 'Completed').length}
            icon="check-circle"
            color="#4CAF50"
          />
          <StatCard
            title="Due Today"
            value={tasks.filter(t => 
              isToday(t.dueDate) && 
              t.status !== 'Completed'
            ).length}
            icon="today"
            color="#FF9800"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {['My Tasks', 'In Progress', 'Completed'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.quickActionButton,
                activeTab === tab && styles.quickActionButtonSelected
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <ThemedText 
                style={[
                  styles.quickActionText,
                  activeTab === tab && styles.quickActionTextSelected
                ]}
              >
                {tab}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Progress Bar - Moved from TaskList to here */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${calculateProgress()}%` }
              ]} 
            />
          </View>
          <ThemedText style={styles.progressText}>
            {calculateProgress()}% Complete
          </ThemedText>
        </View>

        {/* Task Header */}
        <View style={styles.taskHeader}>
          <ThemedText type="subtitle">Tasks</ThemedText>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setIsAddTaskVisible(true)}
          >
            <IconSymbol name="add" size={24} color={themeColors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Task List */}
      <ScrollView 
        style={styles.taskScrollView}
        showsVerticalScrollIndicator={false}
      >
        <TaskList
          tasks={filteredTasks}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
        />
      </ScrollView>

      <AddTaskModal
        visible={isAddTaskVisible}
        onClose={() => setIsAddTaskVisible(false)}
        onAdd={addTask}
      />
    </ThemedView>
  );
}
