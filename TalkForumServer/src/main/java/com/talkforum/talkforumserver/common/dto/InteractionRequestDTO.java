package com.talkforum.talkforumserver.common.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(
    name = "InteractionRequestDTO",
    description = "用户互动请求参数，支持帖子点赞/点踩、评论点赞/点踩、用户关注/取关等互动操作"
)
public class InteractionRequestDTO {
    @Schema(
        description = "互动类型，指定互动对象类型",
        example = "POST",
        requiredMode = Schema.RequiredMode.REQUIRED,
        allowableValues = {"POST", "COMMENT", "USER"}
    )
    @NotBlank
    private String interactType;
    
    @Schema(
        description = "互动目标ID，指定具体的帖子、评论或用户ID",
        example = "1234567890",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotBlank
    private String interactId;
    
    @Schema(
        description = "互动内容，表示具体的互动行为",
        example = "1",
        requiredMode = Schema.RequiredMode.REQUIRED,
        allowableValues = {"-1", "0", "1"}
    )
    @NotNull
    private int interactContent;

    // 被回传
    @Schema(
        description = "用户ID，系统自动从登录状态获取",
        example = "1234567890",
        hidden = true
    )
    private long userId;
    
    // 用于存储之前的互动内容，由MyBatis自动填充
    @Schema(
        description = "之前的互动内容，用于更新操作时的对比",
        example = "0",
        hidden = true
    )
    private Integer oldInteractContent;
}
