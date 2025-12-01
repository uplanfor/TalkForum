package com.talkforum.talkforumserver.common.entity;

import lombok.Data;

import java.util.Date;

/**
 * 用户实体类
 * 对应数据库中的用户表，存储用户的基本信息
 */
@Data
public class User {
    /**
     * 用户ID，主键
     */
    public Long id;
    /**
     * 用户邮箱，用于登录和找回密码
     */
    public String email;
    /**
     * 用户密码，经过加密处理
     */
    public String password;
    /**
     * 用户名，显示在页面上的名称
     */
    public String name;
    /**
     * 用户角色，如普通用户、管理员、版主等
     */
    public String role;
    /**
     * 粉丝数量
     */
    public int fansCount;
    /**
     * 关注数量
     */
    public int followingCount;
    /**
     * 用户简介
     */
    public String intro;
    /**
     * 注册时间
     */
    public Date createdAt;
    /**
     * 最后登录时间
     */
    public Date lastLoginAt;
    /**
     * 用户状态，如正常、封禁等
     */
    public String status;
    /**
     * 头像链接
     */
    public String avatarLink;
    /**
     * 背景图链接
     */
    public String backgroundLink;
    /**
     * 使用的邀请码
     */
    public String usedInviteCode;
}
