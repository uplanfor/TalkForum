package com.talkforum.talkforumserver.common.util;

import com.talkforum.talkforumserver.constant.RedisConstant;
import jakarta.annotation.Resource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
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
     * 尝试获取分布式锁（Lua脚本保证setnx+expire原子性）
     * @param lockKey 锁的Key
     * @param lockValue 锁的值（建议用ThreadId，避免误删）
     * @param expireSeconds 锁的过期时间（秒）
     * @return true=获取锁成功，false=失败
     */
    public boolean tryLock(String lockKey, String lockValue, Long expireSeconds) {
        // Lua脚本：先setnx，成功则设置过期时间，返回1；否则返回0
        String lockScript =
                """
if redis.call('setnx', KEYS[1], ARGV[1]) == 1 then
    redis.call('expire', KEYS[1], ARGV[2])
    return 1
else
    return 0
end
""";
        DefaultRedisScript<Long> redisScript = new DefaultRedisScript<>();
        redisScript.setScriptText(lockScript);
        redisScript.setResultType(Long.class);

        // 执行脚本：KEYS=lockKey，ARGV=[lockValue, expireSeconds]
        List<String> keys = Collections.singletonList(lockKey);
        Long result = stringRedisTemplate.execute(redisScript, keys, lockValue, String.valueOf(expireSeconds));

        // 结果为1表示获取锁成功
        return result != null && result == 1;
    }

    /**
     * 释放分布式锁（Lua脚本保证“校验锁归属+删除锁”原子性，避免误删）
     * @param lockKey 锁的Key
     * @param lockValue 锁的值（必须和加锁时一致）
     * @return true=释放成功，false=释放失败（锁已过期/不属于当前线程）
     */
    public boolean unlock(String lockKey, String lockValue) {
        // Lua脚本：先判断锁的值是否匹配，匹配则删除，返回1；否则返回0
        String unlockScript =
"""
if redis.call('get', KEYS[1]) == ARGV[1] then
    return redis.call('del', KEYS[1])
else
    return 0
end
""";

        DefaultRedisScript<Long> redisScript = new DefaultRedisScript<>();
        redisScript.setScriptText(unlockScript);
        redisScript.setResultType(Long.class);

        // 执行脚本：KEYS=lockKey，ARGV=lockValue
        List<String> keys = Collections.singletonList(lockKey);
        Long result = stringRedisTemplate.execute(redisScript, keys, lockValue);

        // 结果>0表示释放成功
        return result != null && result > 0;
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
            throw new RuntimeException("缓存数据类型与目标类型不匹配", e);
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
