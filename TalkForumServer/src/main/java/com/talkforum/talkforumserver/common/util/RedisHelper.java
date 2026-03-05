package com.talkforum.talkforumserver.common.util;

import com.talkforum.talkforumserver.constant.RedisConstant;
import jakarta.annotation.Resource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Component
public class RedisHelper {
    @Resource
    private RedisTemplate<String, Object> redisTemplate;
    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    public Object stringGet(String key) {
        return stringRedisTemplate.opsForValue().get(key);
    }
    public void stringSet(String key, String value, Long expireTime, TimeUnit timeUnit) {
        stringRedisTemplate.opsForValue().set(key, value, expireTime, timeUnit);
    }

    public void stringDelete(String key) {
        stringRedisTemplate.delete(key);
    }

    /**
     * 存储对象到Redis（利用已配置的JSON序列化，直接存对象）
     * @param key 缓存Key
     * @param obj 要存储的对象（如PostVO）
     * @param expireTime 过期时间
     * @param timeUnit 时间单位
     */
    public <T> void setObject(String key, T obj, Long expireTime, TimeUnit timeUnit) {
        if (obj == null || expireTime == null || expireTime < 0) {
            throw new IllegalArgumentException("对象/过期时间不能为空，且过期时间需≥0");
        }
        redisTemplate.opsForValue().set(key, obj, expireTime, timeUnit);
    }

    /**
     * 从Redis读取对象（自动反序列化为指定类型）
     * @param key 缓存Key
     * @param clazz 目标对象类型（如PostVO.class）
     * @return 反序列化后的对象，null表示缓存不存在
     */
    public <T> T getObject(String key, Class<T> clazz) {
        Object value = redisTemplate.opsForValue().get(key);
        if (value == null) {
            return null;
        }
        // 类型转换（基于RedisTemplate的JSON序列化，可安全转换）
        try {
            return clazz.cast(value);
        } catch (ClassCastException e) {
            throw new RuntimeException(I18n.t("common.server.error"), e);
        }
    }

    /**
     * 删除对象缓存
     * @param key 缓存Key
     */
    public void deleteObject(String key) {
        redisTemplate.delete(key);
    }
}
