// src/config/ThemeConfig.ts
/** 主题 key 联合类型 */
export type ThemeKey = 'teal' | 'yellow' | 'pink' | 'dark';

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
  teal: {
    key: 'teal',
    name: '青绿色系',
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
    name: '鹅黄色系',
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
    name: '粉紫色系',
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
  dark: {
    key: 'dark',
    name: '夜间模式',
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
};

/** 默认主题 key */
export const DEFAULT_THEME_KEY: ThemeKey = 'teal';