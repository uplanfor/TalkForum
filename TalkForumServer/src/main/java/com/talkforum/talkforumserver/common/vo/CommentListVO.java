package com.talkforum.talkforumserver.common.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

@Data
public class CommentListVO {
    @Schema(
            description = "评论列表"
    )
    private List<CommentVO> data;


    @Schema(
            description = "所有用户数量",
            example = "true",
            allowableValues = {"true", "false"}
    )
    private boolean hasMore;
    @Schema(
            description = "游标分页",
            example = "6564"
    )
    private Long cursor;

    public CommentListVO(List<CommentVO> data, boolean hasMore, Long cursor) {
        this.data = data;
        this.hasMore = hasMore;
        this.cursor = cursor;
    }
}
