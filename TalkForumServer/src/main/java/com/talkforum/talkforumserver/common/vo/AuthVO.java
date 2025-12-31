package com.talkforum.talkforumserver.common.vo;

import com.talkforum.talkforumserver.constant.UserConstant;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.Date;
import java.util.List;

/**
 * 用户认证信息视图对象
 * 用于展示用户登录后的完整信息，包括基本资料、统计数据和关注列表
 */
@Data
@Schema(
    name = "AuthVO",
    description = "用户认证信息视图对象，包含用户登录后的完整信息和权限数据"
)
public class AuthVO {
    
    /**
     * 用户唯一标识符
     */
    @Schema(
        description = "用户唯一标识符",
        example = "1234567890",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    private Long id;
    
    /**
     * 用户邮箱地址
     */
    @Schema(
        description = "用户注册邮箱地址",
        example = "user@example.com",
        requiredMode = Schema.RequiredMode.REQUIRED,
        format = "email"
    )
    private String email;
    
    /**
     * 用户昵称
     */
    @Schema(
        description = "用户昵称，用于展示和社区互动",
        example = "张三",
        requiredMode = Schema.RequiredMode.REQUIRED,
        minLength = 2,
        maxLength = 50
    )
    private String name;
    
    /**
     * 用户角色
     */
    @Schema(
        description = "用户角色权限级别",
        example = "USER",
        requiredMode = Schema.RequiredMode.REQUIRED,
        allowableValues = {UserConstant.ROLE_USER, UserConstant.ROLE_ADMIN, UserConstant.ROLE_MODERATOR}
    )
    private String role;
    
    /**
     * 粉丝数量
     */
    @Schema(
        description = "用户粉丝数量统计",
        example = "128",
        requiredMode = Schema.RequiredMode.REQUIRED,
        minimum = "0"
    )
    private int fansCount;
    
    /**
     * 关注数量
     */
    @Schema(
        description = "用户关注其他用户数量统计",
        example = "56",
        requiredMode = Schema.RequiredMode.REQUIRED,
        minimum = "0"
    )
    private int followingCount;
    
    /**
     * 个人简介
     */
    @Schema(
        description = "用户个人简介，展示在个人主页",
        example = "热爱技术，喜欢分享",
        maxLength = 500
    )
    private String intro;
    
    /**
     * 账号创建时间
     */
    @Schema(
        description = "用户账号创建时间",
        example = "2023-01-01T10:00:00.000Z",
        requiredMode = Schema.RequiredMode.REQUIRED,
        format = "date-time"
    )
    private Date createdAt;
    
    /**
     * 最后登录时间
     */
    @Schema(
        description = "用户最后登录时间",
        example = "2023-12-31T23:59:59.000Z",
        format = "date-time"
    )
    private Date lastLoginAt;
    
    /**
     * 账号状态
     */
    @Schema(
        description = "用户账号当前状态",
        example = UserConstant.STATUS_NORMAL,
        requiredMode = Schema.RequiredMode.REQUIRED,
        allowableValues = {UserConstant.STATUS_NORMAL, UserConstant.STATUS_UNABLE}
    )
    private String status;
    
    /**
     * 头像链接
     */
    @Schema(
        description = "用户头像图片链接",
        example = "https://example.com/avatar.jpg",
        format = "uri"
    )
    private String avatarLink;
    
    /**
     * 背景图链接
     */
    @Schema(
        description = "用户个人主页背景图片链接",
        example = "https://example.com/background.jpg",
        format = "uri"
    )
    private String backgroundLink;
    
    /**
     * 关注的用户ID列表
     */
    @Schema(
        description = "用户关注的其他用户ID列表",
        example = "[123, 456, 789]"
    )
    private List<Long> following;

    public AuthVO(UserVO userVO, List<Long> following) {
        this.id = userVO.getId();
        this.email = userVO.getEmail();
        this.name = userVO.getName();
        this.role = userVO.getRole();
        this.fansCount = userVO.getFansCount();
        this.followingCount = userVO.getFollowingCount();
        this.intro = userVO.getIntro();
        this.createdAt = userVO.getCreatedAt();
        this.lastLoginAt = userVO.getLastLoginAt();
        this.status = userVO.getStatus();
        this.avatarLink = userVO.getAvatarLink();
        this.backgroundLink = userVO.getBackgroundLink();
        this.following = following;
    }
}