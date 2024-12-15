import { Modal, View, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';
import { useState } from 'react';
import { Task } from '@/types/task';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, addHours } from 'date-fns';
import * as Notifications from 'expo-notifications';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}

export function AddTaskModal({ visible, onClose, onAdd }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('Medium');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const scheduleNotification = async (taskTitle: string, dueDate: Date) => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;

      // Schedule multiple notifications
      const notifications = [
        {
          title: 'Task Due Soon',
          body: `The task "${taskTitle}" is due in 1 hour!`,
          hours: 1
        },
        {
          title: 'Task Due Now',
          body: `The task "${taskTitle}" is due now! Please update the status.`,
          hours: 0
        },
        {
          title: 'Task Overdue',
          body: `The task "${taskTitle}" is overdue! Please complete it or update the status.`,
          hours: -1 // 1 hour after due time
        }
      ];

      for (const notification of notifications) {
        const trigger = new Date(dueDate);
        trigger.setHours(trigger.getHours() - notification.hours);
        
        await Notifications.scheduleNotificationAsync({
          content: {
            title: notification.title,
            body: notification.body,
            data: { 
              taskId: Date.now().toString(),
              type: 'task_reminder'
            },
          },
          trigger,
        });
      }
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  const handleAdd = async () => {
    if (!title.trim()) return;
    
    const newTask: Omit<Task, 'id' | 'createdAt'> = {
      title: title.trim(),
      description: description.trim(),
      dueDate,
      priority,
      status: 'Pending' as const,
    };
    
    onAdd(newTask);
    await scheduleNotification(newTask.title, newTask.dueDate);
    
    // Reset form
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setDueDate(new Date());
    onClose();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(dueDate.getHours());
      newDate.setMinutes(dueDate.getMinutes());
      setDueDate(newDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(dueDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setDueDate(newDate);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>Add New Task</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <IconSymbol name="more-vert" size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Task Title"
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description (optional)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <View style={styles.dateTimeContainer}>
            <TouchableOpacity 
              style={[styles.dateTimeButton, { marginRight: 8 }]}
              onPress={() => setShowDatePicker(true)}
            >
              <IconSymbol name="calendar" size={24} color="#666666" />
              <ThemedText style={styles.dateTimeText}>
                {format(dueDate, 'MMM dd, yyyy')}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <IconSymbol name="clock.fill" size={24} color="#666666" />
              <ThemedText style={styles.dateTimeText}>
                {format(dueDate, 'hh:mm a')}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            Platform.OS === 'web' ? (
              <input
                type="date"
                value={format(dueDate, 'yyyy-MM-dd')}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  date.setHours(dueDate.getHours());
                  date.setMinutes(dueDate.getMinutes());
                  setDueDate(date);
                  setShowDatePicker(false);
                }}
                style={styles.webDateInput}
              />
            ) : (
              <DateTimePicker
                value={dueDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )
          )}

          {showTimePicker && (
            Platform.OS === 'web' ? (
              <input
                type="time"
                value={format(dueDate, 'HH:mm')}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':');
                  const newDate = new Date(dueDate);
                  newDate.setHours(parseInt(hours));
                  newDate.setMinutes(parseInt(minutes));
                  setDueDate(newDate);
                  setShowTimePicker(false);
                }}
                style={styles.webDateInput}
              />
            ) : (
              <DateTimePicker
                value={dueDate}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )
          )}

          <View style={styles.prioritySelector}>
            <ThemedText>Priority:</ThemedText>
            <View style={styles.priorityButtons}>
              {(['Low', 'Medium', 'High'] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityButton,
                    priority === p && styles.priorityButtonSelected,
                    { backgroundColor: p === 'Low' ? '#4CAF50' : p === 'Medium' ? '#FF9800' : '#F44336' }
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <ThemedText style={styles.priorityButtonText}>{p}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAdd}
          >
            <ThemedText style={styles.addButtonText}>Add Task</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    width: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  prioritySelector: {
    marginBottom: 20,
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  priorityButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  priorityButtonSelected: {
    opacity: 1,
  },
  priorityButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#4A3780',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  dateTimeText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666666',
  },
  webDateInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
  },
}); 