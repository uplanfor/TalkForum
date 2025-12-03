/**
 * 主题配置文件
 * 定义了应用支持的所有主题，包括颜色变量和主题信息
 */

/**
 * 主题 key 联合类型
 * 定义了所有可用的主题标识符
 */
export type ThemeKey = 'default' | 'teal' | 'yellow' | 'pink' | 'dark' | 'grey' | 'purple' |'red';

/**
 * CSS 变量类型
 * 定义了主题中使用的所有 CSS 变量
 */
export interface ThemeVariables {
  /** 主色调 - 用于主要按钮、链接等 */
  '--primary': string;
  /** 次要暖色调 1 - 用于辅助元素、高亮等 */
  '--secondary-warm-1': string;
  /** 次要暖色调 2 - 用于更深层次的辅助元素 */
  '--secondary-warm-2': string;
  /** 次要冷色调 - 用于对比元素、特殊标记等 */
  '--secondary-cool': string;
  /** 中性背景色 - 用于页面背景 */
  '--neutral-bg': string;
  /** 中性模块色 - 用于卡片、面板等模块背景 */
  '--neutral-module': string;
  /** 中性主要文本色 - 用于主要内容文本 */
  '--neutral-text-main': string;
  /** 中性次要文本色 - 用于次要内容、注释等 */
  '--neutral-text-secondary': string;
  /** 中性边框色 - 用于分隔线、边框等 */
  '--neutral-border': string;
  /** 中性阴影色 - 用于元素阴影效果 */
  '--neutral-shadow': string;
}

/**
 * 单个主题配置类型
 * 定义了完整主题的结构
 */
export interface Theme {
  /** 主题唯一标识符 */
  key: ThemeKey;
  /** 主题显示名称 */
  name: string;
  /** 主题 CSS 变量集合 */
  variables: ThemeVariables;
}

/**
 * 主题变化回调函数类型
 * 用于主题切换时的通知
 */
export type ThemeChangeCallback = (theme: Theme) => void;

/**
 * 主题配置集合
 * 包含所有可用主题的具体配置
 */
export const THEMES: Record<ThemeKey, Theme> = {
  /** 灰色主题 - Soft Ash */
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
  /** 深色主题 - Serene Noir */
  dark: {
    key: 'dark',
    name: 'Serene Noir',
    variables: {
      '--primary': '#2d2f33',
      '--secondary-warm-1': '#3d3f43',
      '--secondary-warm-2': '#1a1a1a',
      '--secondary-cool': '#4a5568',
      '--neutral-bg': '#121212',
      '--neutral-module': '#1e1e20',
      '--neutral-text-main': '#e0e0e0',
      '--neutral-text-secondary': '#9e9e9e',
      '--neutral-border': '#2d2f33',
      '--neutral-shadow': 'rgba(0, 0, 0, 0.3)',
    },
  },
  /** 青色主题 - Lush Teal */
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
  /** 黄色主题 - Mellow Yellow */
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
  /** 粉色主题 - Romantic Blush */
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
  /** 紫色主题 - Ethereal Violet */
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
  /** 红色主题 - Festive Vermilion */
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

/**
 * 默认主题 key
 * 应用启动时使用的初始主题
 */
export const DEFAULT_THEME_KEY: ThemeKey = 'teal';