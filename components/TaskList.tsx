import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useMemo } from 'react';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';
import { Menu, MenuItem } from '@/components/ui/Menu';
import { format } from 'date-fns';
import { Task } from '@/types/task';

interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskList({ tasks, onUpdateTask, onDeleteTask }: TaskListProps) {
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'Completed': return '#4CAF50';
      case 'In Progress': return '#FF9800';
      case 'Pending': return '#F44336';
      default: return '#666666';
    }
  };

  const calculateProgress = () => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(task => task.status === 'Completed').length;
    return Math.round((completed / tasks.length) * 100);
  };

  const renderPriorityIcon = (priority: Task['priority']) => {
    const colors = {
      Low: '#4CAF50',
      Medium: '#FF9800',
      High: '#F44336',
    };
    
    return (
      <View style={[styles.priorityIndicator, { backgroundColor: colors[priority] }]} />
    );
  };

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const priorityOrder = {
        'High': 0,
        'Medium': 1,
        'Low': 2
      };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [tasks]);

  const groupTasksByDate = (tasks: Task[]) => {
    const groups: { [key: string]: Task[] } = {};
    
    tasks.forEach(task => {
      const dateKey = format(task.dueDate, 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(task);
    });

    const sortedGroups = Object.entries(groups)
      .sort(([dateA], [dateB]) => {
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      })
      .reduce((acc, [date, tasks]) => {
        acc[date] = tasks;
        return acc;
      }, {} as { [key: string]: Task[] });

    return sortedGroups;
  };

  const groupedTasks = groupTasksByDate(sortedTasks);

  return (
    <View style={styles.container}>
      <View style={styles.taskContent}>
        {Object.entries(groupedTasks).map(([dateKey, dateTasks]) => (
          <View key={dateKey} style={styles.dateGroup}>
            <ThemedText style={styles.dateHeader}>
              {format(new Date(dateKey), 'MMMM dd, yyyy')}
            </ThemedText>
            
            {dateTasks.map((task: Task) => (
              <TouchableOpacity 
                key={task.id} 
                style={[
                  styles.taskItem,
                  { borderLeftColor: getStatusColor(task.status), borderLeftWidth: 4 }
                ]}
                onPress={() => onUpdateTask(task.id, {
                  status: task.status === 'Completed' ? 'Pending' : 'Completed'
                })}
              >
                <View style={styles.taskIcon}>
                  <IconSymbol 
                    name={task.status === 'Completed' ? 'check-circle' : 'assignment'} 
                    size={24} 
                    color={getStatusColor(task.status)} 
                  />
                </View>
                <View style={styles.taskInfo}>
                  <ThemedText style={[
                    styles.taskTitle,
                    task.status === 'Completed' && styles.completedTask
                  ]}>
                    {task.title}
                  </ThemedText>
                  {task.description && (
                    <ThemedText style={styles.description} numberOfLines={2}>
                      {task.description}
                    </ThemedText>
                  )}
                  <View style={styles.taskMeta}>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(task.status) }
                    ]}>
                      <ThemedText style={styles.statusText}>{task.status}</ThemedText>
                    </View>
                    {renderPriorityIcon(task.priority)}
                    <ThemedText style={styles.taskDate}>
                      {format(task.dueDate, 'MMM dd, yyyy')}
                    </ThemedText>
                  </View>
                </View>
                <Menu>
                  <MenuItem 
                    text={task.status === 'Completed' ? 'Mark as Pending' : 'Mark as Complete'}
                    icon={task.status === 'Completed' ? 'assignment' : 'check-circle'}
                    onPress={() => onUpdateTask(task.id, { 
                      status: task.status === 'Completed' ? 'Pending' : 'Completed' 
                    })}
                  />
                  <MenuItem 
                    text="Mark In Progress"
                    icon="today"
                    onPress={() => onUpdateTask(task.id, { status: 'In Progress' })}
                  />
                  <MenuItem 
                    text="Delete"
                    icon="delete"
                    onPress={() => onDeleteTask(task.id)}
                    destructive
                  />
                </Menu>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    width: '100%',
  },
  taskContent: {
    flex: 1,
    width: '100%',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  taskIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskInfo: {
    flex: 1,
    minWidth: 200,
  },
  taskTitle: {
    fontWeight: '600',
    marginBottom: 4,
    color: '#000000',
  },
  taskDate: {
    color: '#666666',
    fontSize: 12,
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#666666',
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  progressContainer: {
    marginBottom: 20,
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#666666',
  },
}); 