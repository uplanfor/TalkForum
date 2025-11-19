package com.talkforum.talkforumserver.common.dto;

import com.sun.istack.NotNull;
import lombok.Data;

@Data
public class UserStatusDTO {
    @NotNull
    private String status;
}
