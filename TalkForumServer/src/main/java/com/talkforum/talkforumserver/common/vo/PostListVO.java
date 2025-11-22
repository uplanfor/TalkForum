package com.talkforum.talkforumserver.common.vo;

import com.talkforum.talkforumserver.common.entity.Post;
import lombok.Data;

import java.util.List;

@Data
public class PostListVO {
    private List<PostVO> data;
    private boolean hasMore;
    private Long cursor;

    public PostListVO(List<PostVO> data, boolean hasMore, Long cursor) {
        this.data = data;
        this.hasMore = hasMore;
        this.cursor = cursor;
    }
}
