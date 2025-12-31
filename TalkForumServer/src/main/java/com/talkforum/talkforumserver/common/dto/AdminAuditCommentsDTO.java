package com.talkforum.talkforumserver.common.dto;

import com.sun.istack.NotNull;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import lombok.Data;

/**
 * 管理员审核评论数据传输对象
 * 用于管理员批量审核评论的请求参数，包含审核状态和待审核的评论ID列表
 */
@Data
@Schema(
    name = "AdminAuditCommentsDTO",
    description = "管理员审核评论请求参数，包含审核状态和待审核的评论ID列表"
)
public class AdminAuditCommentsDTO {
    
    /**
     * 审核状态
     * 评论审核的结果状态，支持通过、拒绝等操作
     */
    @Schema(
        description = "评论审核状态，支持通过、拒绝等操作",
        example = "APPROVED",
        requiredMode = Schema.RequiredMode.REQUIRED,
        allowableValues = {"PENDING", "APPROVED", "REJECTED", "DELETED"}
    )
    @NotNull
    private String status;
    
    /**
     * 评论ID列表
     * 需要审核的评论ID列表，支持批量审核操作
     */
    @Schema(
        description = "需要审核的评论ID列表，支持批量审核操作",
        example = "[123, 456, 789]",
        requiredMode = Schema.RequiredMode.REQUIRED,
        minLength = 1
    )
    @NotNull
    private List<Long> commentIds;
}