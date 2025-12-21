import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
// 静态导入英文语言包（默认语言）
import enTranslation from './locales/en.json';
import zhTranslation from './locales/zh.json';

i18n.use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init(
        {
            fallbackLng: 'en',
            supportedLngs: ['en', 'zh'],
            debug: import.meta.env.DEV,
            interpolation: {
                escapeValue: false,
            },
            // 静态加载的英文语言包（默认语言）
            resources: {
                en: { translation: enTranslation },
                zh: { translation: zhTranslation },
            },
            // 动态加载其他语言包的配置
            backend: {
                loadPath: '/i18n/locales/{{lng}}.json',
                cache: { enabled: false }, // 开发环境关闭缓存，方便调试
            },
            detection: {
                order: ['localStorage', 'navigator', 'cookie'],
                lookupLocalStorage: 'language',
                convertDetectedLanguage: lng => {
                    return lng.split('-')[0].toLowerCase();
                },
            },
        },
        err => {
            if (err) console.error('[i18n 初始化错误]', err);
        }
    );

export default i18n;
