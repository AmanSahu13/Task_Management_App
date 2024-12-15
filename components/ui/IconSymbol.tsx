import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, StyleProp, TextStyle } from 'react-native'; // Changed ViewStyle to TextStyle

// Add your SFSymbol to MaterialIcons mappings here.
const MAPPING = {
  'time': 'access-time',
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'list.bullet': 'format-list-bulleted',
  'plus.circle.fill': 'add-circle',
  'checkmark.circle.fill': 'check-circle',
  'calendar': 'calendar-today',
  'clock.fill': 'access-time',
  'exclamationmark.circle.fill': 'priority-high',
  'eye.fill': 'visibility',
  'menu': 'menu',
  'search': 'search',
  'more-vert': 'more-vert',
  'home': 'home',
  'notifications': 'notifications',
  'person': 'person',
  'add': 'add',
  'task': 'assignment',
  'moon': 'nightlight-round',
  'sun': 'wb-sunny',
  'assignment': 'assignment',
  'check-circle': 'check-circle',
  'edit': 'edit',
  'delete': 'delete',
  'today': 'today',
  'close': 'close',
} as const;

export type IconSymbolName = keyof typeof MAPPING;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>; // Changed from ViewStyle to TextStyle
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}