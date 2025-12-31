package com.talkforum.talkforumserver.common.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 添加评论数据传输对象
 * 用于接收用户提交评论的请求参数，包含评论内容和相关关联信息
 */
@Data
@Schema(
    name = "AddCommentDTO",
    description = "添加评论请求参数，包含评论内容、帖子ID和回复关系信息"
)
public class AddCommentDTO {
    
    /**
     * 帖子ID
     * 评论所属的帖子，必须存在且有效
     */
    @Schema(
        description = "评论所属的帖子ID，必须存在且有效",
        example = "1234567890",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotNull(message="postId cannot be null")
    private Long postId;
    
    /**
     * 评论内容
     * 用户输入的评论文本内容，不能为空且长度有限制
     */
    @Schema(
        description = "评论文本内容，不能为空且长度有限制",
        example = "这是一条很有价值的评论内容",
        requiredMode = Schema.RequiredMode.REQUIRED,
        minLength = 1,
        maxLength = 1000
    )
    @NotBlank(message="content required!")
    private String content;

    /**
     * 根评论ID
     * 当回复其他评论时，表示最顶层的评论ID，用于构建评论树结构
     * 如果是直接评论帖子，此字段为null
     */
    @Schema(
        description = "根评论ID，用于多级评论结构，如果是直接评论帖子则为null",
        example = "1987654210",
        nullable = true
    )
    private Long rootId;
    
    /**
     * 父评论ID
     * 当回复其他评论时，表示直接父评论的ID
     * 如果是直接评论帖子或回复根评论，此字段为null
     */
    @Schema(
        description = "父评论ID，表示直接回复的评论，如果是直接评论帖子则为null",
        example = "8765432109",
        nullable = true
    )
    private Long parentId;
}