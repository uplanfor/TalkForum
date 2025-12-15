package com.talkforum.talkforumserver.common.util;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.context.support.WebApplicationContextUtils;

import java.util.Enumeration;
import java.util.Locale;
import java.util.MissingResourceException;
import java.util.ResourceBundle;

// 复用之前的 I18nUtil 类，核心逻辑不变
public class I18n {
    private static AutoFallbackMessageSource messageSource;

    static {
        try {
            WebApplicationContext context = WebApplicationContextUtils.getWebApplicationContext(
                    ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest().getServletContext()
            );
            messageSource = (AutoFallbackMessageSource) context.getBean("messageSource");
        } catch (Exception e) {
            // 非Web环境兜底
            messageSource = new AutoFallbackMessageSource();
            messageSource.setBasename("i18n/messages");
            messageSource.setDefaultEncoding("UTF-8");
        }
    }

    public static String t(String key) {
        return t(key, new Object[]{});
    }

    public static String t(String key, Object... args) {
        Locale locale = getCurrentLocale();
        try {
            return messageSource.getMessage(key, args, locale);
        } catch (Exception e) {
            return key;
        }
    }

    private static Locale getCurrentLocale() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes == null) return Locale.SIMPLIFIED_CHINESE;
            HttpServletRequest request = attributes.getRequest();
            String langHeader = request.getHeader("Accept-Language");
            if (langHeader == null || langHeader.isEmpty()) return Locale.SIMPLIFIED_CHINESE;
            String lang = langHeader.split(",")[0].trim();
            return Locale.forLanguageTag(lang.replace("_", "-"));
        } catch (Exception e) {
            return Locale.SIMPLIFIED_CHINESE;
        }
    }


    /**
     * 修复无限循环风险：默认语言加载失败时，最终兜底（不循环）
     */
    static class AutoFallbackMessageSource extends ResourceBundleMessageSource {
        // 默认兜底语言（en-US）
        private static final Locale DEFAULT_FALLBACK_LOCALE = Locale.US;
        // 最终兜底的空资源包（避免循环）
        private static final ResourceBundle EMPTY_BUNDLE = new EmptyResourceBundle();

        @Override
        protected ResourceBundle doGetBundle(String basename, Locale locale) {
            try {
                // 1. 先尝试加载目标语言（如zh-CN）
                return super.doGetBundle(basename, locale);
            } catch (MissingResourceException e) {
                // 2. 目标语言加载失败，尝试加载默认语言（en-US）
                try {
                    return super.doGetBundle(basename, DEFAULT_FALLBACK_LOCALE);
                } catch (MissingResourceException ex) {
                    // 3. 最终兜底：返回空资源包（不会再抛异常，避免循环）
                    return EMPTY_BUNDLE;
                }
            }
        }

        @Override
        protected String getMessageInternal(String key, Object[] args, Locale locale) {
            try {
                // 1. 先从目标语言找Key
                return super.getMessageInternal(key, args, locale);
            } catch (MissingResourceException e) {
                // 2. 目标语言无Key，从默认语言找
                try {
                    return super.getMessageInternal(key, args, DEFAULT_FALLBACK_LOCALE);
                } catch (MissingResourceException ex) {
                    // 3. 最终兜底：返回Key本身（便于排查）
                    return key;
                }
            }
        }

        /**
         * 空资源包：当所有语言文件都加载失败时，避免循环的最终兜底
         */
        private static class EmptyResourceBundle extends ResourceBundle {
            @Override
            protected Object handleGetObject(String key) {
                // 空资源包中所有Key都返回null，触发上层的Key兜底逻辑
                return null;
            }

            @Override
            public Enumeration<String> getKeys() {
                // 返回空枚举，标识无任何Key
                return java.util.Collections.emptyEnumeration();
            }
        }
    }
}