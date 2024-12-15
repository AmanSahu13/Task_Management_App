/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

export interface ThemeColors {
  text: string;
  background: string;
  tint: string;
  tabIconDefault: string;
  tabIconSelected: string;
  primary: string;
  border: string;
  mode: 'light' | 'dark';
}

export const Colors = {
  light: {
    text: '#000000',
    background: '#FFFFFF',
    tint: '#4A3780',
    tabIconDefault: '#666666',
    tabIconSelected: '#4A3780',
    primary: '#4A3780',
    border: '#E0E0E0',
    mode: 'light' as const
  },
  dark: {
    text: '#FFFFFF',
    background: '#1A1A1A',
    tint: '#7B61FF',
    tabIconDefault: '#888888',
    tabIconSelected: '#7B61FF',
    primary: '#7B61FF',
    border: '#333333',
    mode: 'dark' as const
  },
} as const;
