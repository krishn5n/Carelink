/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// /app/utils/theme.ts

export const Colors = {
  primary: '#007AFF',       // Blue - main brand color
  secondary: '#4CD964',     // Green - actions / success buttons
  background: '#F8F9FA',    // Light grey / off-white for backgrounds
  cardBackground: '#FFFFFF', // White cards or containers
  textPrimary: '#333333',    // Main text color
  textSecondary: '#666666',  // Secondary text / labels
  border: '#E0E0E0',         // Light border for inputs/cards
  error: '#FF3B30',           // Red for errors / critical alerts
  warning: '#FF9500',         // Orange for warnings
};

export const FontSizes = {
  small: 12,
  regular: 16,
  medium: 18,
  large: 24,
  xlarge: 32,
};

export const Spacing = {
  tiny: 4,
  small: 8,
  regular: 16,
  large: 24,
  xlarge: 32,
};

export const BorderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  round: 9999,
};



export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
