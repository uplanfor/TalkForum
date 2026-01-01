package com.talkforum.talkforumserver.common.dto;

import com.sun.istack.NotNull;
import com.talkforum.talkforumserver.constant.UserConstant;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Schema(
        description = "修改用户的状态参数"
)
@Data
public class UserStatusDTO {
    @Schema(
            description = "用户的状态 UNABLE为经用，NORMAL为正常",
            requiredMode = Schema.RequiredMode.REQUIRED,
            example = UserConstant.STATUS_UNABLE,
            allowableValues = {UserConstant.STATUS_UNABLE, UserConstant.STATUS_NORMAL}
    )
    @NotNull
    private String status;
}
