package com.talkforum.talkforumserver.common.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EssenceDTO {
    @NotNull
    @Schema(
            description = "设置是否为精选"
    )
    private int isEssence;
}
