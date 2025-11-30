package com.talkforum.talkforumserver.common.dto;

import com.sun.istack.NotNull;
import lombok.Data;

@Data
public class AdminGetCommentsDTO {
    private String status;
    @NotNull
    private Integer page;
    @NotNull
    private Integer pageSize;
}
