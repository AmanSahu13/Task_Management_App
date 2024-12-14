import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../ThemedText';
import { IconSymbol, IconSymbolName } from './IconSymbol';

interface StatCardProps {
  title: string;
  value: number;
  icon: IconSymbolName;
  color: string;
}

export function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      <IconSymbol name={icon} size={24} color="#FFFFFF" />
      <ThemedText style={styles.value}>{value}</ThemedText>
      <ThemedText style={styles.title}>{title}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    gap: 8,
    minWidth: 120,
    maxWidth: 200,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 14,
    color: '#FFFFFF',
  },
}); 