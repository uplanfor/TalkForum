package com.talkforum.talkforumserver.config;

import com.talkforum.talkforumserver.interceptor.AdministratorInterceptor;
import com.talkforum.talkforumserver.interceptor.LoginInterceptor;
import com.talkforum.talkforumserver.interceptor.ModeratorInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Autowired
    private LoginInterceptor loginInterceptor;
    @Autowired
    private AdministratorInterceptor administratorInterceptor;
    @Autowired
    private ModeratorInterceptor moderatorInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(loginInterceptor).addPathPatterns("/**");
        registry.addInterceptor(administratorInterceptor).addPathPatterns("/**");
        registry.addInterceptor(moderatorInterceptor).addPathPatterns("/**");
    }

}
