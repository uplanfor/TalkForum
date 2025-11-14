package com.talkforum.talkforumserver.common.dto;

import com.sun.istack.NotNull;
import lombok.Data;

@Data
public class PostRequestDTO {
    String keywords;
    Long clubId;

    @NotNull
    int page;
    @NotNull
    int pageSize;
}
