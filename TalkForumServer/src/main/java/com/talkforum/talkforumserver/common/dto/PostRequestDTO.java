package com.talkforum.talkforumserver.common.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PostRequestDTO {
    String keyword;
    Long[] clubIds;
    Long[] userIds;
    Integer isEssence;
    String tag;

    Long cursor;
    @NotNull(message = "Page size cannot be null!")
    int pageSize;
}
