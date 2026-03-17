import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// 静态导入英文语言包
import enTranslation from './locales/en.json';
import zhTranslation from './locales/zh.json';

i18n.use(LanguageDetector)
    // .use(Backend)
    .use(initReactI18next)
    .init(
        {
            // 核心配置项
            fallbackLng: 'en', // 降级语言：检测不到支持的语言时，默认使用英文
            supportedLngs: ['en', 'zh'], // 项目支持的语言列表（仅允许这两种）
            interpolation: {
                escapeValue: false, // 关闭值转义：React 本身会自动转义 HTML 特殊字符，避免双重转义导致显示异常
            },
            // 静态注册语言包：把导入的 JSON 语言包挂载到 i18n 实例中
            resources: {
                en: { translation: enTranslation }, // 英文语言包，key 为 translation（固定命名）
                zh: { translation: zhTranslation }, // 中文语言包
            },
            // 语言检测的详细配置（对应 LanguageDetector 插件）
            detection: {
                order: ['localStorage', 'navigator', 'cookie'], // 检测语言的优先级：先查 localStorage → 再查浏览器默认语言 → 最后查 Cookie
                lookupLocalStorage: 'language', // 查 localStorage 时，读取的 key 是 "language"（比如 localStorage.getItem('language')）
                convertDetectedLanguage: lng => {
                    // 处理检测到的语言标识：比如把 "zh-CN" "zh-TW" 统一转为 "zh"，把 "en-US" 转为 "en"
                    return lng.split('-')[0].toLowerCase();
                },
            },
        },
        // 初始化错误回调：如果初始化失败（比如语言包加载异常），打印错误日志
        err => {
            if (err) console.error('[i18n 初始化错误]', err);
        }
    );

export default i18n;
