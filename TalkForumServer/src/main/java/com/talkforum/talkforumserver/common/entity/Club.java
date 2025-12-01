package com.talkforum.talkforumserver.common.entity;

import lombok.Data;

/**
 * 俱乐部实体类
 * 对应数据库中的俱乐部表，存储论坛俱乐部的基本信息
 */
@Data
public class Club {
    /**
     * 俱乐部ID，主键
     */
    public Long id;
    /**
     * 俱乐部名称
     */
    public String name;
    /**
     * 俱乐部描述
     */
    public String description;
    /**
     * 俱乐部头像链接
     */
    public String avatarLink;
    /**
     * 俱乐部背景图链接
     */
    public String backgroundLink;
    /**
     * 创建者ID，外键关联User表
     */
    public String creatorId;
    /**
     * 创建时间
     */
    public String createAt;
    /**
     * 成员数量
     */
    public Integer memberCount;
    /**
     * 是否删除，Y表示是，N表示否
     */
    public Character isDeleted;
}
