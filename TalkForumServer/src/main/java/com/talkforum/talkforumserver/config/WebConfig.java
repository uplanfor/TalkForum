package com.talkforum.talkforumserver.config;

import com.talkforum.talkforumserver.interceptor.AdministratorInterceptor;
import com.talkforum.talkforumserver.interceptor.LoginInterceptor;
import com.talkforum.talkforumserver.interceptor.ModeratorInterceptor;
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
    private AdministratorInterceptor administratorInterceptor; // 管理员权限拦截器
    @Autowired
    private ModeratorInterceptor moderatorInterceptor; // 版主权限拦截器

    /**
     * 注册拦截器
     * @param registry 拦截器注册表
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(loginInterceptor).addPathPatterns("/**"); // 对所有路径应用登录拦截器
        registry.addInterceptor(administratorInterceptor).addPathPatterns("/**"); // 对所有路径应用管理员拦截器
        registry.addInterceptor(moderatorInterceptor).addPathPatterns("/**"); // 对所有路径应用版主拦截器
    }

}
