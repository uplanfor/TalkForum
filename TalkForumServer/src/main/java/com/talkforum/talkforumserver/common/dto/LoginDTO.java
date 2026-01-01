package com.talkforum.talkforumserver.common.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Schema(
        description = "登录时的请求参数"
)
@Data
public class LoginDTO {
    @Schema(
            description = "即将登陆的用户的用户名或邮箱"
    )
    @NotNull(message="Please commit your name or email!")
    public String nameOrEmail;

    @Schema(
            description = "登陆的密码"
    )
    @NotNull(message="Please commit your password!")
    public String password;
}
