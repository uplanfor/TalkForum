package com.talkforum.talkforumserver.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;

/**
 * Redis配置类
 * 配置Redis操作模板，用于简化Redis数据操作
 */
@Configuration
public class RedisConfig {
//    /**
//     * 配置RedisTemplate，用于操作对象类型数据
//     * @param factory Redis连接工厂
//     * @return RedisTemplate实例
//     */
//    @Bean
//    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
//        RedisTemplate<String, Object> redisTemplate = new RedisTemplate<>();
//        redisTemplate.setConnectionFactory(factory);
//        return redisTemplate;
//    }

    /**
     * 配置StringRedisTemplate，用于操作字符串类型数据
     * @param factory Redis连接工厂
     * @return StringRedisTemplate实例
     */
    @Bean
    public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory factory) {
        return new StringRedisTemplate(factory);
    }
}
