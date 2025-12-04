package com.talkforum.talkforumserver.common.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InteractionRequestDTO {
    @NotBlank
    private String interactType;
    @NotBlank
    private String interactId;
    @NotNull
    private int interactContent;

    // 被回传
    private long userId;
    
    // 用于存储之前的互动内容，由MyBatis自动填充
    private Integer oldInteractContent;
}
