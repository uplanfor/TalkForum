package com.talkforum.talkforumserver.common.dto;

import com.sun.istack.NotNull;
import com.talkforum.talkforumserver.constant.PostConstant;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;


/**
 * 管理员获取帖子子列表数据传输对象
 * 用于管理员后台分页获取帖子列表的请求参数，支持按状态筛选
 */
@Data
@Schema(
        description = "管理员获取帖子列表请求参数，支持按状态筛选和分页查询"
)
public class AdminGetPostsDTO {
    @Schema(
            description = "帖子的关键词",
            example = "电力"
    )
    String keyword;

    @Schema(
            description = "帖子状态",
            example = PostConstant.PASS,
            allowableValues = {PostConstant.PASS, PostConstant.PENDING, PostConstant.DELETED, PostConstant.REJECTED}
    )
    String status;

    @Schema(
            description = "根据圈子id列表筛选",
            example = "[12, 6]"
    )
    Long[] clubIds;

    @Schema(
            description = "根据用户id进行筛选",
            example = "[65， 133]"
    )
    Long[] userIds;

    @Schema(
            description = "根据标签进行筛选",
            example = "电力系统"
    )
    String tag;

    @Schema(
            description = "根据精选状态进行筛选(非0为真，1为假)",
            allowableValues = {"1", "0"}
    )
    int isEssence = 0;

    @Schema(
            description = "页号"
    )
    int page;

    @Schema(
            description = "每页数量",
            maximum = "10",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotNull
    int pageSize;
}
