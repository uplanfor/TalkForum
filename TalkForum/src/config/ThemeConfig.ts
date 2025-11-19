// src/config/ThemeConfig.ts
/** 主题 key 联合类型 */
export type ThemeKey = 'default' | 'teal' | 'yellow' | 'pink' | 'dark' | 'grey' | 'purple' |'red';

/** CSS 变量类型 */
export interface ThemeVariables {
  '--primary': string;
  '--secondary-warm-1': string;
  '--secondary-warm-2': string;
  '--secondary-cool': string;
  '--neutral-bg': string;
  '--neutral-module': string;
  '--neutral-text-main': string;
  '--neutral-text-secondary': string;
  '--neutral-border': string;
  '--neutral-shadow': string;
}

/** 单个主题配置类型 */
export interface Theme {
  key: ThemeKey;
  name: string;
  variables: ThemeVariables;
}

/** 主题变化回调函数类型 */
export type ThemeChangeCallback = (theme: Theme) => void;

/** 主题配置集合 */
export const THEMES: Record<ThemeKey, Theme> = {
  grey: {
    key: 'grey',
    name: 'Soft Ash',
    variables: {
      '--primary': '#F0F0F2',
      '--secondary-warm-1': '#F5F5F7',
      '--secondary-warm-2': '#E0E0E4',
      '--secondary-cool': '#60A5FA',
      '--neutral-bg': '#FAFAFA',
      '--neutral-module': '#FFFFFF',
      '--neutral-text-main': '#2D3748',
      '--neutral-text-secondary': '#718096',
      '--neutral-border': '#E5E7EB',
      '--neutral-shadow': '#F2F2F2',
    },
  },
  dark: {
    key: 'dark',
    name: 'Serene Noir',
    variables: {
      '--primary': '#2d2f33',
      '--secondary-warm-1': '#3d3f43',
      '--secondary-warm-2': '#8b4513',
      '--secondary-cool': '#4a5568',
      '--neutral-bg': '#121212',
      '--neutral-module': '#1e1e20',
      '--neutral-text-main': '#e0e0e0',
      '--neutral-text-secondary': '#9e9e9e',
      '--neutral-border': '#2d2f33',
      '--neutral-shadow': 'rgba(0, 0, 0, 0.3)',
    },
  },
  teal: {
    key: 'teal',
    name: 'Lush Teal',
    variables: {
      '--primary': '#2dd6bb',
      '--secondary-warm-1': '#76e5d5',
      '--secondary-warm-2': '#1aa891',
      '--secondary-cool': '#60a5fa',
      '--neutral-bg': '#f0fdfa',
      '--neutral-module': '#ffffff',
      '--neutral-text-main': '#2d3748',
      '--neutral-text-secondary': '#718096',
      '--neutral-border': '#e0f2fe',
      '--neutral-shadow': '#e8f4f8',
    },
  },
  yellow: {
    key: 'yellow',
    name: 'Mellow Yellow',
    variables: {
      '--primary': '#fae556',
      '--secondary-warm-1': '#fcf076',
      '--secondary-warm-2': '#e6c200',
      '--secondary-cool': '#4299e1',
      '--neutral-bg': '#fefdf9',
      '--neutral-module': '#ffffff',
      '--neutral-text-main': '#2d3748',
      '--neutral-text-secondary': '#718096',
      '--neutral-border': '#f5f5f5',
      '--neutral-shadow': '#faf6ed',
    },
  },
  pink: {
    key: 'pink',
    name: 'Romantic Blush',
    variables: {
      '--primary': '#fb779a',
      '--secondary-warm-1': '#fca5b4',
      '--secondary-warm-2': '#e6496e',
      '--secondary-cool': '#9f7aea',
      '--neutral-bg': '#fef7fb',
      '--neutral-module': '#ffffff',
      '--neutral-text-main': '#2d3748',
      '--neutral-text-secondary': '#718096',
      '--neutral-border': '#fce4ec',
      '--neutral-shadow': '#faf0f5',
    },
  },
  purple: {
    key: 'purple',
    name: 'Ethereal Violet',
    variables: {
      '--primary': '#8B5Cf6',
      '--secondary-warm-1': '#A78BFA',
      '--secondary-warm-2': '#7C3AED',
      '--secondary-cool': '#C4B5FD',
      '--neutral-bg': '#FAF5FF',
      '--neutral-module': '#FFFFFF',
      '--neutral-text-main': '#2D3748',
      '--neutral-text-secondary': '#718096',
      '--neutral-border': '#EDE9FE',
      '--neutral-shadow': '#F3E8FF',
    },
  },
  red: {
    key: 'red',
    name: 'Festive Vermilion',
    variables: {
      '--primary': '#FF5A6F',
      '--secondary-warm-1': '#FF8795',
      '--secondary-warm-2': '#E11D48',
      '--secondary-cool': '#FECDD3',
      '--neutral-bg': '#FFF5F5',
      '--neutral-module': '#FFFFFF',
      '--neutral-text-main': '#2D3748',
      '--neutral-text-secondary': '#718096',
      '--neutral-border': '#FECDD3',
      '--neutral-shadow': '#FEE2E2',
    },
  },
};

/** 默认主题 key */
export const DEFAULT_THEME_KEY: ThemeKey = 'teal';