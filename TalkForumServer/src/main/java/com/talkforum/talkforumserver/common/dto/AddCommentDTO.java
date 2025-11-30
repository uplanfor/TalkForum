package com.talkforum.talkforumserver.common.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddCommentDTO {
    @NotNull(message="postId cannot be null")
    private Long postId;
    @NotBlank(message="content required!")
    private String content;

    private Long rootId;
    private Long parentId;
}
