package com.talkforum.talkforumserver.common.vo;

import com.talkforum.talkforumserver.common.entity.Comment;
import lombok.Data;

import java.util.List;

@Data
public class CommentListVO {
    private List<Comment> data;
    private boolean hasMore;
    private Long cursor;

    public CommentListVO(List<Comment> data, boolean hasMore, Long cursor) {
        this.data = data;
        this.hasMore = hasMore;
        this.cursor = cursor;
    }
}
