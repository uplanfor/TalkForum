package com.talkforum.talkforumserver.common.dto;

import com.sun.istack.NotNull;
import com.talkforum.talkforumserver.constant.CommentConstant;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 管理员获取评论列表数据传输对象
 * 用于管理员后台分页获取评论列表的请求参数，支持按状态筛选
 */
@Data
@Schema(
    name = "AdminGetCommentsDTO",
    description = "管理员获取评论列表请求参数，支持按状态筛选和分页查询"
)
public class AdminGetCommentsDTO {
    
    /**
     * 评论状态筛选条件
     * 用于筛选特定状态的评论，如待审核、已发布、已删除等
     * 不传递此参数表示获取所有状态的评论
     */
    @Schema(
        description = "评论状态筛选条件，支持按状态筛选评论列表",
        example = CommentConstant.PASS,
        nullable = true,
        allowableValues = {CommentConstant.PASS, CommentConstant.PENDING, CommentConstant.REJECTED, CommentConstant.DELETED}
    )
    private String status;
    
    /**
     * 当前页码
     * 分页查询的页码，从1开始计数
     */
    @Schema(
        description = "当前页码，分页查询参数，从1开始",
        example = "1",
        requiredMode = Schema.RequiredMode.REQUIRED,
        minimum = "1"
    )
    @NotNull
    private Integer page;
    
    /**
     * 每页大小
     * 每页显示的记录数量，用于控制分页查询的结果数量
     */
    @Schema(
        description = "每页显示的记录数量，分页查询参数",
        example = "20",
        requiredMode = Schema.RequiredMode.REQUIRED,
        minimum = "1",
        maximum = "10"
    )
    @NotNull
    private Integer pageSize;
}