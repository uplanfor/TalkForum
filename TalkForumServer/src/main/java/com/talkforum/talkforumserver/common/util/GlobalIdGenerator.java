package com.talkforum.talkforumserver.common.util;

import cn.hutool.core.lang.Snowflake;
import cn.hutool.core.util.IdUtil;

/**
 * 全局统一ID生成器（共用雪花算法，生成所有业务的ID）
 */
public class GlobalIdGenerator {
    // 全局单例雪花实例（核心：唯一实例，避免重复）
    private static final Snowflake SNOWFLAKE;

    static {
        // 自动生成唯一workerId（适配分布式部署）
        // 为什么可以这样？
        // 局域网id唯一，有几率使得计算结果有差别
        long workerId = cn.hutool.core.net.NetUtil.ipv4ToLong(cn.hutool.core.net.NetUtil.getLocalhostStr()) % 32;
        SNOWFLAKE = IdUtil.getSnowflake(workerId, 0);
        // 关闭时钟回拨容忍，保证ID递增且不重复
//        SNOWFLAKE.setClockBackwardTolerance(0);
    }

    // 私有构造器，禁止实例化
    // 这是单例模式吗？
    private GlobalIdGenerator() {}

    /**
     * 生成全局唯一ID（通用方法，所有业务都可调用）
     */
    public static long generateId() throws RuntimeException {
        return SNOWFLAKE.nextId();
    }

    /**
     * 生成全局唯一ID（字符串形式）
     */
    public static String generateIdStr() throws RuntimeException {
        return SNOWFLAKE.nextIdStr();
    }
}