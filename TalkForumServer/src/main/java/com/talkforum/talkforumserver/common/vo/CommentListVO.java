package com.talkforum.talkforumserver.common.vo;

import lombok.Data;

import java.util.List;

@Data
public class CommentListVO {
    private List<CommentVO> data;
    private boolean hasMore;
    private Long cursor;

    public CommentListVO(List<CommentVO> data, boolean hasMore, Long cursor) {
        this.data = data;
        this.hasMore = hasMore;
        this.cursor = cursor;
    }
}
