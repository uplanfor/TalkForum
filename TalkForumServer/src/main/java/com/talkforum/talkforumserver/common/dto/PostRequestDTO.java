package com.talkforum.talkforumserver.common.dto;

import com.sun.istack.NotNull;
import lombok.Data;

@Data
public class PostRequestDTO {
    String keywords;
    Long clubId;
    Long userId;
    int isEssence = 0;

    Long cursor;
    @NotNull
    int pageSize;
}
