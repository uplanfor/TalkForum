package com.talkforum.talkforumserver.common.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.Date;

@Schema(
    name = "Interaction",
    description = "用户互动实体类，存储用户对帖子、评论、用户的互动行为记录"
)
public class Interaction {
    @Schema(
        description = "互动记录唯一标识符，数据库主键",
        example = "1234567890",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    public Long id;
    
    @Schema(
        description = "用户ID，外键关联用户表",
        example = "1234567890",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    public Long userId;
    
    @Schema(
        description = "互动内容，表示具体的互动行为",
        example = "1",
        requiredMode = Schema.RequiredMode.REQUIRED,
        allowableValues = {"-1", "0", "1"}
    )
    public Integer interactContent;
    
    @Schema(
        description = "互动目标类型，指定互动对象类型",
        example = "POST",
        requiredMode = Schema.RequiredMode.REQUIRED,
        allowableValues = {"POST", "COMMENT", "USER"}
    )
    public String interactTargetType;
    
    @Schema(
        description = "互动目标ID，指定具体的帖子、评论或用户ID",
        example = "1234567890",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    public Integer interactTarget;
    
    @Schema(
        description = "互动时间，记录用户执行互动操作的时间",
        example = "2024-01-01T12:00:00Z",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    public Date interactDate;
}
