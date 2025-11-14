// src/utils/ThemeUtil.ts
import { type ThemeKey, THEMES, DEFAULT_THEME_KEY, type Theme, type ThemeChangeCallback } from '../config/ThemeConfig';

class ThemeUtil {
  private static currentThemeKey: ThemeKey = DEFAULT_THEME_KEY;
  private static callbacks: Set<ThemeChangeCallback> = new Set();

  /**
   * 加载指定主题
   * @param themeKey 主题key
   */
  static loadTheme(themeKey: ThemeKey): void {
    const theme = THEMES[themeKey];
    if (!theme) return;

    // 应用CSS变量
    Object.entries(theme.variables).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });

    // 更新当前主题
    this.currentThemeKey = themeKey;
    
    // 保存到localStorage
    localStorage.setItem('theme', themeKey);

    // 触发回调
    this.notifyThemeChange(theme);
  }

  /**
   * 获取当前主题
   */
  static getTheme(): ThemeKey {
    return this.currentThemeKey;
  }

  /**
   * 切换主题
   * @param themeKey 主题key
   */
  static switchTheme(themeKey: ThemeKey): void {
    this.loadTheme(themeKey);
  }

  /**
   * 添加主题变化监听
   * @param callback 回调函数
   */
  static onThemeChange(callback: ThemeChangeCallback): void {
    this.callbacks.add(callback);
  }

  /**
   * 移除主题变化监听
   * @param callback 回调函数
   */
  static offThemeChange(callback: ThemeChangeCallback): void {
    this.callbacks.delete(callback);
  }

  /**
   * 初始化主题（从localStorage或使用默认主题）
   */
  static init(): void {
    const savedTheme = localStorage.getItem('theme') as ThemeKey;
    if (savedTheme && THEMES[savedTheme]) {
      this.loadTheme(savedTheme);
    } else {
      this.loadTheme(DEFAULT_THEME_KEY);
    }
  }

  private static notifyThemeChange(theme: Theme): void {
    this.callbacks.forEach(callback => callback(theme));
  }
}

// 导出实例
export default ThemeUtil;
