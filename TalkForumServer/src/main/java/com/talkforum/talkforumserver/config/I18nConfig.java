package com.talkforum.talkforumserver.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ResourceBundleMessageSource;

@Configuration
public class I18nConfig {
    // 核心：加载国际化资源文件
    @Bean
    public ResourceBundleMessageSource messageSource() {
        ResourceBundleMessageSource ms = new ResourceBundleMessageSource();
        ms.setBasename("com.talkforum.talkforumserver.i18n.messages"); // ✅ 正确的完整路径
        ms.setDefaultEncoding("UTF-8"); // 解决中文乱码
        ms.setUseCodeAsDefaultMessage(true); // 文本缺失时返回key本身（便于排查）
        return ms;
    }
}