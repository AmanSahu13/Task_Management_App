import { Modal, View, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';
import { useState } from 'react';
import { Task } from '@/types/task';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
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

  const scheduleNotification = async (taskTitle: string, dueDate: Date) => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;

      // Schedule notification for 1 hour before due date
      const trigger = new Date(dueDate);
      trigger.setHours(trigger.getHours() - 1);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Task Due Soon',
          body: `The task "${taskTitle}" is due in 1 hour!`,
          data: { taskId: Date.now().toString() },
        },
        trigger,
      });
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
      setDueDate(selectedDate);
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

          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <IconSymbol name="calendar" size={24} color="#666666" />
            <ThemedText style={styles.dateText}>
              {format(dueDate, 'PPP')}
            </ThemedText>
          </TouchableOpacity>

          {showDatePicker && (
            Platform.OS === 'web' ? (
              <input
                type="date"
                value={format(dueDate, 'yyyy-MM-dd')}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  setDueDate(date);
                  setShowDatePicker(false);
                }}
                style={{
                  padding: 12,
                  borderWidth: 1,
                  borderColor: '#E0E0E0',
                  borderRadius: 8,
                  marginBottom: 16,
                  width: '100%',
                }}
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 16,
  },
  dateText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666666',
  },
}); 