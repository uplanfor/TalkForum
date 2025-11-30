package com.talkforum.talkforumserver.common.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LoginDTO {
    @NotNull(message="Please commit your name or email!")
    public String nameOrEmail;
    @NotNull(message="Please commit your password!")
    public String password;
}
