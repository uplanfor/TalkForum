package com.talkforum.talkforumserver.common.dto;

import com.sun.istack.NotNull;
import com.talkforum.talkforumserver.constant.UserConstant;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Schema(
        description = "修改用户头像的参数"
)
@Data
public class UserRoleDTO {
    @Schema(
            description = "用户的角色",
            requiredMode = Schema.RequiredMode.REQUIRED,
            example = UserConstant.ROLE_USER,
            allowableValues = {UserConstant.ROLE_USER, UserConstant.ROLE_MODERATOR}
    )
    @NotNull
    private String role;
}
