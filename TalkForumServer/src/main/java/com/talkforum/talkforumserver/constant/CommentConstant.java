package com.talkforum.talkforumserver.constant;

/**
 * 评论相关常量类
 * 定义了评论的状态常量和最大长度限制
 */
public class CommentConstant {
    public static final String PENDING = "PENDING"; // 评论待审核状态
    public static final String PASS = "PASS"; // 评论审核通过状态
    public static final String REJECTED = "REJECTED"; // 评论审核拒绝状态
    public static final String DELETED = "DELETED"; // 评论已删除状态

    public static final int MAX_POST_LENGTH = 200; // 评论内容最大长度限制
}
