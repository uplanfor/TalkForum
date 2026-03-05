package com.talkforum.talkforumserver.common.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Schema(
        description = "帖子请求参数"
)
@Data
public class PostRequestDTO {
    @Schema(
            description = "关键词"
    )
    String keyword;

    @Schema(
            description = "根据圈子id筛选"
    )
    Long[] clubIds;

    @Schema(
            description = "根据用户id筛选"
    )
    Long[] userIds;

    @Schema(
            description = "精选状态筛选"
    )
    Integer isEssence;

    @Schema(
            description = "根据标签筛选"
    )
    String tag;

    @Schema(
            description = "游标分页查询"
    )
    Long cursor;

    @Schema(
            description = "分页大小",
            minimum = "5",
            maximum = "10",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotNull(message = "Page size cannot be null!")
    int pageSize;
}
