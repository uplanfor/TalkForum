package com.talkforum.talkforumserver.constant;

/**
 * Redis键相关常量类
 * 定义了Redis中使用的键前缀和常量
 */
public class RedisConstant {
    // 分布式锁时间
    public static final long LOCK_EXPIRE_SEC = 5L;
    // 空值缓存过期时间（5分钟，解决缓存穿透）
    public static final long NULL_VALUE_EXPIRE_SEC = 5 * 60L;
    // 随机过期偏移量（0-10分钟，解决缓存雪崩）
    public static final long RANDOM_OFFSET_SEC = 10 * 60L;

    public static final String TOKEN_USER_PREFIX = "token:user:"; // 用户令牌前缀，用于存储用户登录令牌
    public static final String RATE_LIMIT_PREFIX = "rate_limit:"; // 限流前缀，用于限流
    public static final String POST_CACHE_PREFIX = "post_cache:"; // 帖子缓存前缀
    public static final String POST_CACHE_LOCK_PREFIX = "post_cache:lock:"; // 帖子缓存分布式锁前缀
    public static final long POST_BASE_EXPIRE_SEC = 30 * 60L;
    public static final String POST_HIT_NONE = "HIT_NONE";
    
    // 用户缓存相关常量
    public static final String USER_CACHE_PREFIX = "user_cache:"; // 用户缓存前缀
    public static final String USER_CACHE_LOCK_PREFIX = "user_cache:lock:"; // 用户缓存分布式锁前缀
    public static final long USER_BASE_EXPIRE_SEC = 30 * 60L; // 用户缓存基础过期时间（30分钟）
    public static final String USER_HIT_NONE = "HIT_NONE"; // 用户缓存空值标识

}
