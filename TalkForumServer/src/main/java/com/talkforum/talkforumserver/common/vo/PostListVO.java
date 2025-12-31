package com.talkforum.talkforumserver.common.vo;

import com.talkforum.talkforumserver.common.entity.Post;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

@Data
@Schema(
        name = "PostListVO",
        description = "帖子列表视图"
)
public class PostListVO {
    @Schema(
            description = "所有帖子"
    )
    private List<PostVO> data;
    @Schema(
            description = "判断还有没有更多"
    )
    private boolean hasMore;
    @Schema(
            description = "游标分页"
    )
    private Long cursor;

    public PostListVO(List<PostVO> data, boolean hasMore, Long cursor) {
        this.data = data;
        this.hasMore = hasMore;
        this.cursor = cursor;
    }
}
