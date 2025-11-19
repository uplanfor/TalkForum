package com.talkforum.talkforumserver.common.dto;

import com.sun.istack.NotNull;
import lombok.Data;

@Data
public class UserRoleDTO {
    @NotNull
    private String role;
}
