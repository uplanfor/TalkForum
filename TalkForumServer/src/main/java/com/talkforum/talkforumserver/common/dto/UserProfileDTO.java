package com.talkforum.talkforumserver.common.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Schema(
        description = "修改用户个人信息的参数"
)
@Data
public class UserProfileDTO {
    @Schema(
            description = "用户的id(根据Cookie填充)",
            requiredMode =  Schema.RequiredMode.NOT_REQUIRED
    )
    public Long id;              // 临时变量

    @Schema(
            description = "用户的名称",
            requiredMode =  Schema.RequiredMode.REQUIRED,
            minLength = 1,
            maxLength = 16,
            example = "abc"
    )
    @Size(min = 1, max = 16, message = "The length of your name must be between 1 and 16!")
    public String name;

    @Schema(
            description = "用户的自我介绍"
    )
    @Size(max = 64, message = "Your introduction is too long!")
    public String intro;

    @Schema(
            description = "用户的头像链接"
    )
    public String avatarLink;

    @Schema(
            description = "用户的背景链接"
    )
    public String backgroundLink;
}
