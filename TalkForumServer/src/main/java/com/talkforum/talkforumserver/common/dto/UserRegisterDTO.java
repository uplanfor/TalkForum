package com.talkforum.talkforumserver.common.dto;

import com.sun.istack.NotNull;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Schema(
        description = "用户注册时的参数"
)
@Data
public class UserRegisterDTO {
    @Schema(
            description = "用户的id，被回传",
            requiredMode =  Schema.RequiredMode.NOT_REQUIRED
    )
    public Long id;

    @Schema(
            description = "用户的昵称(非空)",
            requiredMode =  Schema.RequiredMode.REQUIRED,
            minLength = 1,
            maxLength = 16
    )
    @NotBlank
    @Size(min = 1, max = 16, message = "The length of your name must be between 1 and 16!")
    public String name;

    @Schema(
            description = "注册的邮箱(非空)",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotBlank
    @Email
    public String email;

    @Schema(
            description = "用户的密码(非空)"
    )
    @NotBlank
    public String password;

    @Schema(
            description = "用户的角色(被回传)",
            requiredMode = Schema.RequiredMode.NOT_REQUIRED
    )
    public String role;

    public String inviteCode;
}
