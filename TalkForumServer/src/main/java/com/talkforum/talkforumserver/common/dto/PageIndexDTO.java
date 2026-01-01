package com.talkforum.talkforumserver.common.dto;

import com.sun.istack.NotNull;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class PageIndexDTO {
    @Schema(
            description = "分页页码"
    )
    @NotNull
    private Integer page;

    @Schema(
            description = "分页大小",
            maximum = "10"
    )
    @NotNull
    private Integer pageSize;
}
