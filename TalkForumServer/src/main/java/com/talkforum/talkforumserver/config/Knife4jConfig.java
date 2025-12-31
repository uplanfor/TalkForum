package com.talkforum.talkforumserver.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.github.xiaoymin.knife4j.spring.annotations.EnableKnife4j;

/**
 * Knife4j配置类：必须添加@EnableKnife4j注解
 */
@EnableKnife4j // 核心注解：开启Knife4j增强功能
@Configuration
public class Knife4jConfig {
    /**
     * 配置OpenAPI文档基本信息
     */
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("TalkForum 论坛系统 API 文档")
                        .version("1.0.0")
                        .description("论坛认证模块、用户模块等接口文档，包含登录、登出、管理员权限接口"));
    }
}