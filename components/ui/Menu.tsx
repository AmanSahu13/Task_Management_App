import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '../ThemedText';
import { IconSymbol, IconSymbolName } from './IconSymbol';

interface MenuItemProps {
  text: string;
  icon: IconSymbolName;
  onPress: () => void;
  destructive?: boolean;
}

export function MenuItem({ text, icon, onPress, destructive }: MenuItemProps) {
  return (
    <TouchableOpacity 
      style={styles.menuItem} 
      onPress={onPress}
    >
      <IconSymbol 
        name={icon} 
        size={20} 
        color={destructive ? '#F44336' : '#666666'} 
      />
      <ThemedText style={[
        styles.menuText,
        destructive && styles.destructiveText
      ]}>
        {text}
      </ThemedText>
    </TouchableOpacity>
  );
}

export function Menu({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.menu}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  menu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 8,
  },
  menuText: {
    fontSize: 14,
  },
  destructiveText: {
    color: '#F44336',
  },
}); 