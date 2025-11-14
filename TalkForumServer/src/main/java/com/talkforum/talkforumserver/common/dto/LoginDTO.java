package com.talkforum.talkforumserver.common.dto;

import com.sun.istack.NotNull;
import lombok.Data;

@Data
public class LoginDTO {
    @NotNull
    public String nameOrEmail;
    @NotNull
    public String password;
}
