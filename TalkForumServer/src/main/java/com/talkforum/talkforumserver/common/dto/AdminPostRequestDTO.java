package com.talkforum.talkforumserver.common.dto;

import com.sun.istack.NotNull;
import lombok.Data;

@Data
public class AdminPostRequestDTO {
    String keyword;
    String status;
    Long[] clubIds;
    Long[] userIds;
    int isEssence = 0;

    int page;
    @NotNull
    int pageSize;
}
