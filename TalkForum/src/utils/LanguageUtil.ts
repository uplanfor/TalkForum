import i18n from '../i18n/index';

const LANG_CONFIG = {
    DEFAULT_LANG: 'en', // 仅保留简写：en/zh
    STORAGE_KEY: 'language',
    AVAILABLE_LANGS: [
        { value: 'en', label: 'English' }, // 仅简写
        { value: 'zh', label: '简体中文' }, // 仅简写
    ],
};
export const LanguageUtil = {
  // 初始化语言（优先本地存储 → 浏览器语言 → 兜底）
  async init(): Promise<string> {
    const storedLang = localStorage.getItem(LANG_CONFIG.STORAGE_KEY);
    if (storedLang && this.isLangSupported(storedLang)) {
      await i18n.changeLanguage(storedLang);
      return storedLang;
    }

    const browserLang = navigator.language.split('-')[0].toLowerCase();
    if (this.isLangSupported(browserLang)) {
      await i18n.changeLanguage(browserLang);
      localStorage.setItem(LANG_CONFIG.STORAGE_KEY, browserLang);
      return browserLang;
    }

    await i18n.changeLanguage(LANG_CONFIG.DEFAULT_LANG);
    localStorage.setItem(LANG_CONFIG.STORAGE_KEY, LANG_CONFIG.DEFAULT_LANG);
    return LANG_CONFIG.DEFAULT_LANG;
  },

  // 切换语言
  async switchLanguage(lng: string): Promise<boolean> {
    if (!this.isLangSupported(lng)) return false;
    await i18n.changeLanguage(lng);
    localStorage.setItem(LANG_CONFIG.STORAGE_KEY, lng);
    return true;
  },

  // 校验语言是否支持
  isLangSupported(lng: string): boolean {
    return LANG_CONFIG.AVAILABLE_LANGS.some(item => item.value === lng);
  },

  // 获取当前语言
  getCurrentLanguage():string {
    return this.isLangSupported(i18n.language) ? i18n.language : LANG_CONFIG.DEFAULT_LANG;
  },
};