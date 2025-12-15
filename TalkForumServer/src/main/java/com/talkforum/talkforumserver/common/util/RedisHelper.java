package com.talkforum.talkforumserver.common.util;

import com.talkforum.talkforumserver.constant.RedisKeyConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Component
public class RedisHelper {
    @Autowired
    private RedisTemplate<Object, Object> redisTemplate;
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

    // 用于获取登录令牌
    public Object getLoginToken(Long userId) {
        return stringGet(RedisKeyConstant.TOKEN_USER + userId);
    }

    // 用于设置登录令牌
    public void setLoginToken(Long userId, String token, Long expireTime, TimeUnit timeUnit) {
        stringSet(
                RedisKeyConstant.TOKEN_USER + userId, token, expireTime, timeUnit);
    }

    // 用于移除登录令牌
    public void removeLoginToken(Long userId) {
        stringDelete(RedisKeyConstant.TOKEN_USER + userId);
    }
}
