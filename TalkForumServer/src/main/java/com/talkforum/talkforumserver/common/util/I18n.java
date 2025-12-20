package com.talkforum.talkforumserver.common.util;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.log4j.Log4j2;
import org.springframework.context.MessageSource;
import org.springframework.context.NoSuchMessageException;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.support.RequestContextUtils;

import java.util.Locale;
import java.util.ResourceBundle;

/**
 * 国际化工具类
 * 提供静态方法获取国际化消息
 */
@Log4j2
public class I18n {

    private static MessageSource messageSource;

    static {
        try {
            WebApplicationContext context = WebApplicationContextUtils.getWebApplicationContext(
                    ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest().getServletContext()
            );
            if (context != null) {
                messageSource = context.getBean("messageSource", MessageSource.class);
                log.info("I18n工具类初始化成功，使用Spring MessageSource");
            }
        } catch (Exception e) {
            // 非Web环境兜底
            log.warn("无法在Web环境中获取MessageSource，使用兜底方案: {}", e.getMessage());
            ResourceBundleMessageSource fallbackSource = new ResourceBundleMessageSource();
            fallbackSource.setBasename("com.talkforum.talkforumserver.i18n.messages");
            fallbackSource.setDefaultEncoding("UTF-8");
            fallbackSource.setUseCodeAsDefaultMessage(true);
            messageSource = fallbackSource;
        }
    }

    /**
     * 获取国际化消息（无参数）
     *
     * @param key 消息键
     * @return 国际化消息
     */
    public static String t(String key) {
        return t(key, new Object[]{});
    }

    /**
     * 获取国际化消息（带参数）
     *
     * @param key 消息键
     * @param args 参数数组
     * @return 国际化消息
     */
    public static String t(String key, Object... args) {
        try {
            Locale currentLocale = getCurrentLocale();
            String message = messageSource.getMessage(key, args, currentLocale);
            log.debug("Successfully retrieved translation for key: {} in locale: {}", key, currentLocale);
            return message;
        } catch (NoSuchMessageException e) {
            // 记录缺失翻译键的警告信息
            log.warn("Missing translation key: '{}' for locale: {}. Returning key as fallback.", 
                    key, getCurrentLocale());
            // 如果找不到对应的消息，返回key本身，便于调试
            return key;
        } catch (Exception e) {
            // 记录其他异常情况
            log.error("Error retrieving translation for key: '{}' in locale: {}. Error: {}", 
                    key, getCurrentLocale(), e.getMessage());
            return key;
        }
    }

    /**
     * 获取当前请求的Locale
     *
     * @return 当前Locale
     */
    public static Locale getCurrentLocale() {
        try {
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
            LocaleResolver localeResolver = RequestContextUtils.getLocaleResolver(request);
            if (localeResolver != null) {
                return localeResolver.resolveLocale(request);
            }
        } catch (Exception e) {
            // 忽略异常，使用默认Locale
        }
        return Locale.ENGLISH; // 默认英文
    }

    /**
     * 自定义MessageSource，支持自动降级
     */
    public static class AutoFallbackMessageSource extends ResourceBundleMessageSource {
        
        @Override
        protected ResourceBundle getResourceBundle(String basename, Locale locale) {
            try {
                ResourceBundle bundle = super.getResourceBundle(basename, locale);
                if (bundle != null) {
                    return bundle;
                }
            } catch (Exception e) {
                // 忽略异常，继续降级
            }
            
            // 逐级降级：zh_CN -> zh -> en_US -> en -> 空资源包
            if ("zh_CN".equals(locale.toString())) {
                return getResourceBundle(basename, Locale.CHINESE);
            } else if ("zh".equals(locale.toString())) {
                return getResourceBundle(basename, Locale.US);
            } else if ("en_US".equals(locale.toString())) {
                return getResourceBundle(basename, Locale.ENGLISH);
            } else if ("en".equals(locale.toString())) {
                return new EmptyResourceBundle();
            }
            
            return new EmptyResourceBundle();
        }
    }

    /**
     * 空资源包，避免NullPointerException
     */
    private static class EmptyResourceBundle extends ResourceBundle {
        @Override
        protected Object handleGetObject(String key) {
            return null;
        }

        @Override
        public java.util.Enumeration<String> getKeys() {
            return java.util.Collections.emptyEnumeration();
        }
    }
}