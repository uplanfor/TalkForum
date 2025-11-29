package com.talkforum.talkforumserver.common.dto;

import com.sun.istack.NotNull;
import lombok.Data;

@Data
public class AddCommentDTO {
    @NotNull
    private Long postId;
    @NotNull
    private String content;

    private Long rootId;
    private Long parentId;
}
