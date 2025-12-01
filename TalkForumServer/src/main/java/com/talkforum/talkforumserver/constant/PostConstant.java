package com.talkforum.talkforumserver.constant;

/**
 * 帖子相关常量类
 * 定义帖子状态和长度限制的常量值
 */
public class PostConstant {
    /**
     * 待审核状态
     */
    public static final String PENDING = "PENDING";
    /**
     * 审核通过状态
     */
    public static final String PASS = "PASS";
    /**
     * 审核拒绝状态
     */
    public static final String REJECTED = "REJECTED";
    /**
     * 已删除状态
     */
    public static final String DELETED = "DELETED";

    /**
     * 帖子最大长度限制
     */
    public static final int MAX_POST_LENGTH = 200;
}
