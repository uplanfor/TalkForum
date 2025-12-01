package com.talkforum.talkforumserver.common.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EssenceDTO {
    @NotNull
    private int isEssence;
}
