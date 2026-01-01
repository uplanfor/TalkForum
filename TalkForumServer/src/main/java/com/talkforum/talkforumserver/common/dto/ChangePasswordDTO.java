package com.talkforum.talkforumserver.common.dto;

import com.sun.istack.NotNull;
import com.talkforum.talkforumserver.common.util.PasswordHelper;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Schema(
        description = "修改密码时提交的参数"
)
@Data
public class ChangePasswordDTO {
    @Schema(
            description = "旧的密码",
            example = "12345678"
    )
    @NotNull
    private String oldPassword;
    @Schema(
            description = "新的密码",
            example = "12345678"
    )
    @NotNull
    private String newPassword;
}
