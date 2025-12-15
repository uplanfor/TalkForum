import i18n from '../i18n/index'; // 对应src/i18n/index.ts

const LANG_CONFIG = {
  DEFAULT_LANG: 'en', // 仅保留简写：en/zh
  STORAGE_KEY: 'language',
  AVAILABLE_LANGS: [
    { value: 'en', label: 'English' },   // 仅简写
    { value: 'zh', label: '简体中文' }   // 仅简写
  ]
};

export const LanguageUtil = {
  // 初始化（异步，加载语言包）
  async init(): Promise<string> {
    return await this.loadLanguage();
  },

  // 初始化语言：仅处理简写，异步加载服务器对应简写的语言包
  async loadLanguage(): Promise<string> {
    // 1. 优先读取本地存储的简写语言（en/zh）
    const storedLang = localStorage.getItem(LANG_CONFIG.STORAGE_KEY);
    if (storedLang && this.isLangSupported(storedLang)) {
      await this.loadLangFromServer(storedLang); // 加载对应简写的语言包
      return storedLang;
    }

    // 2. 解析浏览器语言 → 仅提取简写（en-US→en，zh-CN→zh，en→en）
    const browserLang = navigator.language;
    const parsedLangShort = browserLang.split('-')[0].toLowerCase(); // 最终仅en/zh

    // 3. 解析的简写合法 → 加载服务器语言包并存储
    if (this.isLangSupported(parsedLangShort)) {
      try {
        await this.loadLangFromServer(parsedLangShort);
        localStorage.setItem(LANG_CONFIG.STORAGE_KEY, parsedLangShort);
        return parsedLangShort;
      } catch (err) {
        console.error(`加载 ${parsedLangShort} 语言包失败`, err);
      }
    }

    // 4. 解析失败/不支持 → 加载默认语言（en）
    await this.loadLangFromServer(LANG_CONFIG.DEFAULT_LANG);
    localStorage.setItem(LANG_CONFIG.STORAGE_KEY, LANG_CONFIG.DEFAULT_LANG);
    return LANG_CONFIG.DEFAULT_LANG;
  },

  // 核心：加载服务器上「简写命名」的语言包（如 en.json/zh.json）
  async loadLangFromServer(shortLang: string): Promise<void> {
    // try {
    //   // 如果是默认语言(en)，直接切换，因为已经静态加载了
    //   if (shortLang === LANG_CONFIG.DEFAULT_LANG) {
    //     await i18n.changeLanguage(shortLang);
    //     return;
    //   }
      
    //   // 对于非默认语言，先加载语言包，再切换
    //   await i18n.loadLanguages(shortLang);
    //   await i18n.changeLanguage(shortLang);
      
    //   // 强制触发资源更新
    //   i18n.reloadResources(shortLang);
      
    //   console.log(`成功加载并切换到 ${shortLang} 语言包`);
    // } catch (error) {
    //   console.error(`加载 ${shortLang} 语言包失败:`, error);
    //   throw error;
    // }
  },

  // 切换语言：仅接收简写（en/zh），返回切换结果
  async switchLanguage(targetLang: string): Promise<boolean> {
    // 校验仅针对简写
    if (!this.isLangSupported(targetLang)) {
      await this.loadLangFromServer(LANG_CONFIG.DEFAULT_LANG);
      return false;
    }

    try {
      await this.loadLangFromServer(targetLang);
      localStorage.setItem(LANG_CONFIG.STORAGE_KEY, targetLang); // 存储简写
      
      // 确保触发语言变化事件
      console.log(`语言切换完成: ${targetLang}, i18n.language: ${i18n.language}`);
      
      return true;
    } catch (err) {
      console.error(`切换 ${targetLang} 语言失败`, err);
      await this.loadLangFromServer(LANG_CONFIG.DEFAULT_LANG);
      return false;
    }
  },

  // 获取所有支持的语言（仅返回简写配置）
  getAllAvailableLanguages(): Array<{ value: string; label: string }> {
    return [...LANG_CONFIG.AVAILABLE_LANGS]; // 仅en/zh
  },

  // 获取当前语言（仅返回简写：en/zh）
  getCurrentLanguage(): string {
    const currentLang = i18n.language; // i18n内部已存储简写（en/zh）
    // 校验是否为支持的简写，否则返回默认
    return this.isLangSupported(currentLang) ? currentLang : LANG_CONFIG.DEFAULT_LANG;
  },

  // 校验是否为支持的简写语言（仅en/zh）
  isLangSupported(lang: string): boolean {
    return LANG_CONFIG.AVAILABLE_LANGS.some(item => item.value === lang);
  }
};