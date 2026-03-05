package com.talkforum.talkforumserver.config;

import com.talkforum.talkforumserver.interceptor.LoginInterceptor;
import com.talkforum.talkforumserver.interceptor.RateLimitInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web配置类
 * 用于配置Spring MVC的拦截器，实现登录验证、管理员权限验证等功能
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Autowired
    private LoginInterceptor loginInterceptor; // 登录验证拦截器
    @Autowired
    private RateLimitInterceptor rateLimitInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(rateLimitInterceptor).addPathPatterns("/**").
                excludePathPatterns("/doc.html", "/webjars/**", "/knife4j/**", "/v3/api-docs/**");
        registry.addInterceptor(loginInterceptor).addPathPatterns("/**").
                excludePathPatterns("/doc.html", "/webjars/**", "/knife4j/**", "/v3/api-docs/**");
    }

}
