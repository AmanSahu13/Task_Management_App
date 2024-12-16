import { useState, useMemo, useContext, useEffect, useRef } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, Modal, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isToday, isSameWeek, format } from 'date-fns';

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

// Add this interface for notifications
interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
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
    paddingVertical: 16,
  },
  userGreeting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greetingText: {
    marginLeft: 8,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: themeColors.text,
  },
  subGreeting: {
    fontSize: 14,
    color: themeColors.text,
    opacity: 0.7,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 4,
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
  notificationContainer: {
    position: 'relative',
    backgroundColor: themeColors.background,
    padding: 16,
    borderRadius: 12,
  },
  notificationPanel: {
    maxHeight: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    backgroundColor: themeColors.background,
    borderTopWidth: 1,
    borderTopColor: themeColors.tint,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.tint,
    marginBottom: 16,
  },
  notificationList: {
    flex: 1,
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
    flexDirection: 'column',
    backgroundColor: themeColors.background,
    marginBottom: 8,
  },
  notificationContent: {
    flex: 1,
    marginLeft: 12,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: themeColors.text,
  },
  notificationItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: themeColors.text,
    marginBottom: 4,
  },
  notificationItemMessage: {
    fontSize: 14,
    color: themeColors.text,
    opacity: 0.9,
    marginBottom: 4,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: themeColors.text,
    opacity: 0.7,
  },
  emptyText: {
    textAlign: 'center',
    color: themeColors.text,
    opacity: 0.8,
    marginTop: 20,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#F44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  taskHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

const NOTIFICATION_TYPES = {
  TASK_DUE: 'TASK_DUE',
  TASK_OVERDUE: 'TASK_OVERDUE',
  TASK_STATUS: 'TASK_STATUS'
} as const;

// Helper function to check if notification is about task completion
const isCompletionNotification = (message: string) => {
  const lowerMessage = message.toLowerCase();
  // Only return true if the message indicates task completion
  return lowerMessage.includes('completed') || 
         lowerMessage.includes('complete') && 
         !lowerMessage.includes('please complete');
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(useColorScheme() ?? 'light');
  const themeColors = Colors[colorScheme] as typeof Colors.light;
  const styles = StyleSheet.create(createStyles(themeColors));
  const [activeTab, setActiveTab] = useState('My tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<TaskFilters>({});
  const [isAddTaskVisible, setIsAddTaskVisible] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationAnimation = useRef(new Animated.Value(0)).current;

  // Theme toggle function
  const toggleTheme = async () => {
    const newTheme = colorScheme === 'light' ? 'dark' : 'light';
    setColorScheme(newTheme);
    
    // Remove the notification creation code
    // Just save the theme preference
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  // Add this function to handle notification panel visibility
  const toggleNotificationPanel = (visible: boolean) => {
    if (visible) {
      setShowNotifications(true);
      Animated.timing(notificationAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(notificationAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowNotifications(false);
      });
    }
  };

  // Add auto-hide for notification panel
  useEffect(() => {
    if (showNotifications) {
      const timer = setTimeout(() => {
        setShowNotifications(false);
      }, 10000); // Changed to 10 seconds

      return () => clearTimeout(timer);
    }
  }, [showNotifications]);

  // Add task management functions
  const addTask = (newTask: Omit<Task, 'id' | 'createdAt'>) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setTasks(prev => [...prev, task]);
  };

  // Modify the handleTaskStatusChange function
  const handleTaskStatusChange = (task: Task, newStatus: Task['status']) => {
    // Only create notification if the task is not being marked as completed
    if (newStatus !== 'Completed') {
      const notification: Notification = {
        id: Date.now().toString(),
        title: 'Task Status Update',
        message: `Task "${task.title}" is now ${newStatus}`,
        timestamp: new Date(),
        read: false
      };
      handleNotification(notification);
    }
  };

  // Modify the updateTask function
  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => {
      const updatedTasks = prev.map(task => {
        if (task.id === taskId) {
          const updatedTask = { ...task, ...updates };
          
          // Check if status has changed
          if (updates.status && updates.status !== task.status) {
            // Only create notification if the task is not being marked as completed
            if (task.dueDate < new Date() && updates.status !== 'Completed') {
              const notification: Notification = {
                id: Date.now().toString(),
                title: 'Task Status Update',
                message: `Overdue task "${task.title}" status changed to ${updates.status}. Please complete it ASAP!`,
                timestamp: new Date(),
                read: false
              };
              handleNotification(notification);
            }
          }
          
          return updatedTask;
        }
        return task;
      });
      return updatedTasks;
    });
  };

  // Add this function to clear old notifications
  const clearOldNotifications = () => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    setNotifications(prev => 
      prev.filter(notification => notification.timestamp > twentyFourHoursAgo)
    );
    // Update unread count after clearing
    setUnreadCount(prev => {
      const newUnreadCount = notifications.filter(
        n => !n.read && n.timestamp > twentyFourHoursAgo
      ).length;
      return newUnreadCount;
    });
  };

  // Modify the deleteTask function to remove related notifications
  const deleteTask = (taskId: string) => {
    setTasks(prev => {
      const taskToDelete = prev.find(task => task.id === taskId);
      const updatedTasks = prev.filter(task => task.id !== taskId);
      
      // Remove notifications related to this task
      if (taskToDelete) {
        setNotifications(prevNotifications => 
          prevNotifications.filter(notification => 
            !notification.message.includes(`"${taskToDelete.title}"`)
          )
        );
        // Update unread count
        setUnreadCount(prev => {
          const newUnreadCount = notifications.filter(
            n => !n.read && !n.message.includes(`"${taskToDelete.title}"`)
          ).length;
          return newUnreadCount;
        });
      }

      // If no tasks left, clear all notifications
      if (updatedTasks.length === 0) {
        setNotifications([]);
        setUnreadCount(0);
      }
      
      return updatedTasks;
    });
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

  // Add this function to handle notifications
  const handleNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  // Modify the checkTasksAtExactTime function
  const checkTasksAtExactTime = () => {
    const now = new Date();
    tasks.forEach(task => {
      // Skip completed tasks
      if (task.status === 'Completed') return;

      const taskTime = new Date(task.dueDate);
      const timeDiff = Math.abs(now.getTime() - taskTime.getTime());
      
      // Check if current time matches task time (within 1 minute tolerance)
      if (timeDiff <= 60000) {
        let message = '';
        let title = '';
        
        switch (task.status) {
          case 'Pending':
            title = 'Task Due Now - Still Pending';
            message = `Task "${task.title}" is due now but hasn't been started! Please begin working on it.`;
            break;
          case 'In Progress':
            title = 'Task Due Now - In Progress';
            message = `Task "${task.title}" is due now and still in progress! Please try to complete it soon.`;
            break;
        }

        if (message && (!task.lastNotified || 
            (new Date(task.lastNotified).getTime() + 300000) < now.getTime())) { // 5-minute cooldown
          const notification: Notification = {
            id: Date.now().toString(),
            title,
            message,
            timestamp: new Date(),
            read: false
          };
          handleNotification(notification);
          
          // Update lastNotified timestamp
          updateTask(task.id, { lastNotified: new Date() });
        }
      }
    });
  };

  // Add useEffect to check tasks every minute
  useEffect(() => {
    const interval = setInterval(checkTasksAtExactTime, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [tasks]);

  // Modify the existing checkOverdueTasks function
  const checkOverdueTasks = () => {
    const now = new Date();
    tasks.forEach(task => {
      if (task.dueDate < now && task.status !== 'Completed') {
        let message = '';
        let title = '';
        
        switch (task.status) {
          case 'Pending':
            title = 'Task Overdue - Pending';
            message = `Task "${task.title}" is overdue and still pending! Please start working on it.`;
            break;
          case 'In Progress':
            title = 'Task Overdue - In Progress';
            message = `Task "${task.title}" is overdue and still in progress! Please complete it soon.`;
            break;
        }

        if (message && (!task.lastNotified || 
            (new Date(task.lastNotified).getTime() + 3600000) < now.getTime())) { // 1-hour cooldown for overdue
          const notification: Notification = {
            id: Date.now().toString(),
            title,
            message,
            timestamp: new Date(),
            read: false
          };
          handleNotification(notification);
          
          // Update lastNotified timestamp
          updateTask(task.id, { lastNotified: new Date() });
        }
      }
    });
  };

  // Add useEffect to periodically check overdue tasks
  useEffect(() => {
    // Check immediately when component mounts
    checkOverdueTasks();

    // Set up interval to check every 5 minutes
    const interval = setInterval(checkOverdueTasks, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [tasks]);

  // Add useEffect for 24-hour notification cleanup
  useEffect(() => {
    // Clear old notifications on component mount
    clearOldNotifications();

    // Set up interval to clear old notifications every hour
    const interval = setInterval(clearOldNotifications, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Modify the notification panel rendering and animation logic
  const notificationPanelStyle = {
    transform: [{
      translateY: notificationAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [600, 0], // Slide up from bottom
      })
    }]
  };

  // Add this effect to watch tasks length and clear notifications when tasks are empty
  useEffect(() => {
    if (tasks.length === 0) {
      // Clear all notifications
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [tasks.length]);

  return (
    <ThemedView style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Sticky Header */}
      <View style={[styles.stickyContent, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          {/* User Profile and Greeting */}
          <View style={styles.userGreeting}>
            <IconSymbol name="person" size={32} color={themeColors.primary} />
            <View style={styles.greetingText}>
              <ThemedText style={styles.greeting}>Hello, Aman!</ThemedText>
              <ThemedText style={styles.subGreeting}>Have a nice day!</ThemedText>
            </View>
          </View>

          {/* Right side icons */}
          <View style={styles.headerIcons}>
            {/* Notification Icon */}
            <TouchableOpacity 
              onPress={() => toggleNotificationPanel(true)}
              style={styles.iconButton}
            >
              <View>
                <IconSymbol name="notifications" size={24} color={themeColors.text} />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <ThemedText style={styles.badgeText}>
                      {unreadCount}
                    </ThemedText>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            {/* Theme Toggle */}
            <TouchableOpacity 
              onPress={toggleTheme} 
              style={styles.themeToggle}
            >
              <IconSymbol 
                name={colorScheme === 'light' ? 'moon' : 'sun'}
                size={24}
                color={themeColors.text}
              />
            </TouchableOpacity>
          </View>

          {/* Notification Modal */}
          {showNotifications && (
            <Modal
              transparent
              visible={showNotifications}
              animationType="none"
              onRequestClose={() => toggleNotificationPanel(false)}
            >
              <TouchableOpacity 
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(0,0,0,0.5)'
                }}
                activeOpacity={1}
                onPress={() => toggleNotificationPanel(false)}
              >
                <Animated.View 
                  style={[
                    styles.notificationPanel,
                    notificationPanelStyle,
                    { backgroundColor: themeColors.background }
                  ]}
                >
                  <View style={styles.notificationHeader}>
                    <ThemedText style={styles.notificationTitle}>Notifications</ThemedText>
                    <TouchableOpacity onPress={() => toggleNotificationPanel(false)}>
                      <IconSymbol name="close" size={24} color={themeColors.text} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.notificationList}>
                    {notifications.length === 0 ? (
                      <ThemedText style={styles.emptyText}>No notifications</ThemedText>
                    ) : (
                      notifications.map((notification) => (
                        <TouchableOpacity 
                          key={notification.id}
                          style={[
                            styles.notificationItem,
                            !notification.read && {
                              backgroundColor: colorScheme === 'light' 
                                ? '#F0F0F0'  
                                : '#2A2A2A',
                              borderLeftWidth: 4,
                              borderLeftColor: themeColors.primary,
                            }
                          ]}
                          onPress={() => {
                            setNotifications(prev =>
                              prev.map(n =>
                                n.id === notification.id ? { ...n, read: true } : n
                              )
                            );
                            setUnreadCount(prev => Math.max(0, prev - 1));
                          }}
                        >
                          <ThemedText style={[
                            styles.notificationItemTitle,
                            isCompletionNotification(notification.message) && {
                              color: '#4CAF50'
                            }
                          ]}>
                            {notification.title}
                          </ThemedText>
                          <ThemedText style={[
                            styles.notificationItemMessage,
                            isCompletionNotification(notification.message) && {
                              color: colorScheme === 'light' ? '#2E7D32' : '#81C784'
                            }
                          ]}>
                            {notification.message}
                          </ThemedText>
                          <ThemedText style={[
                            styles.notificationTime,
                            isCompletionNotification(notification.message) && {
                              color: colorScheme === 'light' ? '#2E7D32' : '#81C784'
                            }
                          ]}>
                            {format(notification.timestamp, 'MMM dd, yyyy HH:mm')}
                          </ThemedText>
                        </TouchableOpacity>
                      ))
                    )}
                  </ScrollView>
                </Animated.View>
              </TouchableOpacity>
            </Modal>
          )}
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
          <ThemedText 
            style={[
              styles.taskHeaderText,
              { color: themeColors.text }
            ]} 
            type="subtitle"
          >
            Tasks
          </ThemedText>
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
