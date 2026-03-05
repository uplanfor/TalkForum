package com.talkforum.talkforumserver.config;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.module.SimpleModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import java.io.IOException;

/**
 * Jackson 序列化配置类
 */
// 解决了id 序列化的问题
@Configuration
public class JacksonConfig {

    @Bean
    public Jackson2ObjectMapperBuilder jackson2ObjectMapperBuilder() {
        Jackson2ObjectMapperBuilder builder = new Jackson2ObjectMapperBuilder();

        // 创建自定义模块
        SimpleModule module = new SimpleModule();

        // 注册 Long 类型序列化器（覆盖默认规则）
        module.addSerializer(Long.class, new LongToStringSerializer());
        // 注册 long 基本类型序列化器（避免遗漏）
        module.addSerializer(long.class, new LongToStringSerializer());

        // 将模块添加到 ObjectMapper
        builder.modules(module);

        return builder;
    }
    public static class LongToStringSerializer extends JsonSerializer<Long> {

        @Override
        public void serialize(Long value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
            // 处理 null 值，避免序列化出 "null" 字符串
            if (value == null) {
                gen.writeNull();
            } else {
                gen.writeString(value.toString());
            }
        }
    }

}