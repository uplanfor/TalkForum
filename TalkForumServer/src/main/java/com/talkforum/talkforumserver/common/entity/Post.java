package com.talkforum.talkforumserver.common.entity;

import lombok.Data;

import java.util.Date;

/**
 * 帖子实体类
 * 对应数据库中的帖子表，存储论坛帖子的基本信息
 */
@Data
public class Post {
    /**
     * 帖子ID，主键
     */
    public Long id;
    /**
     * 帖子标题
     */
    public String title;
    /**
     * 帖子内容
     */
    public String content;
    /**
     * 发帖用户ID，外键关联User表
     */
    public Long userId;
    /**
     * 所属俱乐部ID，外键关联Club表
     */
    public Long clubId;
    /**
     * 帖子摘要
     */
    public String brief;
    /**
     * 帖子状态，如待审核、已发布、已删除等
     */
    public String status;
    /**
     * 是否精华帖，Y表示是，N表示否
     */
    public Character isEssence;
    /**
     * 创建时间
     */
    public Date createdAt;
    /**
     * 更新时间
     */
    public Date updatedAt;
    /**
     * 浏览量
     */
    public Integer viewCount;
    /**
     * 点赞数
     */
    public Integer likeCount;
    /**
     * 评论数
     */
    public Integer commentCount;
}
