package com.talkforum.talkforumserver.common.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.util.Date;

/**
 * 邀请码实体类
 * 用于存储和管理系统中的邀请码信息，包括邀请码本身、创建者、创建时间、过期时间等
 */
@Data
@Schema(
    name = "InviteCode",
    description = "邀请码实体类，存储邀请码的完整信息，包括邀请码字符串、创建者、有效期、使用状态等"
)
public class InviteCode {
    /**
     * 邀请码字符串
     * 唯一标识一个邀请码，用于用户注册时验证
     */
    @Schema(
        description = "邀请码字符串，唯一标识一个邀请码",
        example = "ABC123DEF456",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    public String code;

    /**
     * 创建者ID
     * 记录创建该邀请码的管理员用户ID
     */
    @Schema(
        description = "创建者ID，记录创建该邀请码的管理员用户ID",
        example = "1234567890",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    public Long creatorId;

    /**
     * 创建时间
     * 记录邀请码的生成时间
     */
    @Schema(
        description = "创建时间，记录邀请码的生成时间",
        example = "2024-01-01T12:00:00Z",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    public Date createdAt;

    /**
     * 过期时间
     * 邀请码的有效期限，超过此时间后邀请码将失效
     */
    @Schema(
        description = "过期时间，邀请码的有效期限，超过此时间后邀请码将失效",
        example = "2024-02-01T12:00:00Z",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    public Date expiredAt;

    /**
     * 最大使用次数
     * 该邀请码可以被使用的最大次数，默认为1
     */
    @Schema(
        description = "最大使用次数，该邀请码可以被使用的最大次数",
        example = "1",
        requiredMode = Schema.RequiredMode.REQUIRED,
        minimum = "1",
        maximum = "100"
    )
    public int maxCount;

    /**
     * 已使用次数
     * 记录该邀请码已被使用的次数，初始为0
     */
    @Schema(
        description = "已使用次数，记录该邀请码已被使用的次数",
        example = "0",
        requiredMode = Schema.RequiredMode.REQUIRED,
        minimum = "0"
    )
    public int usedCount;
}
