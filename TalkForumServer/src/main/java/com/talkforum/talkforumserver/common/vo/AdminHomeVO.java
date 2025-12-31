package com.talkforum.talkforumserver.common.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(
        name = "AdminHomeVO",
        description = "审核视图VO"
)
public class AdminHomeVO {
    @Schema(
            description = "所有用户数量",
            example = "156045"
    )
    private long totalUsers;


    @Schema(
            description = "所有帖子数量",
            example = "156045"
    )
    private long totalPosts;


    @Schema(
            description = "所有举报数量",
            example = "156045"
    )
    private long totalReports;


    @Schema(
            description = "未审核帖子数量",
            example = "156045"
    )
    private long postsNotHandled;


    @Schema(
            description = "未审核评论数量",
            example = "156045"
    )
    private long commentsNotHandled;


    @Schema(
            description = "未处理举报数量",
            example = "156045"
    )
    private long reportsNotHandled;
}
