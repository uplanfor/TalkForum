package com.talkforum.talkforumserver.common.entity;

import lombok.Data;
import java.util.Date;

/**
 * 邀请码实体类
 * 用于存储和管理系统中的邀请码信息，包括邀请码本身、创建者、创建时间、过期时间等
 */
@Data
public class InviteCode {
    /**
     * 邀请码字符串
     * 唯一标识一个邀请码，用于用户注册时验证
     */
    public String code;

    /**
     * 创建者ID
     * 记录创建该邀请码的管理员用户ID
     */
    public Long creatorId;

    /**
     * 创建时间
     * 记录邀请码的生成时间
     */
    public Date createdAt;

    /**
     * 过期时间
     * 邀请码的有效期限，超过此时间后邀请码将失效
     */
    public Date expiredAt;

    /**
     * 最大使用次数
     * 该邀请码可以被使用的最大次数，默认为1
     */
    public int maxCount = 1;

    /**
     * 已使用次数
     * 记录该邀请码已被使用的次数，初始为0
     */
    public int usedCount = 0;

    /**
     * 邀请码状态
     * 1表示有效，0表示无效，默认为1
     */
    public int status = 1;  // 1: 有效, 0: 无效
}
