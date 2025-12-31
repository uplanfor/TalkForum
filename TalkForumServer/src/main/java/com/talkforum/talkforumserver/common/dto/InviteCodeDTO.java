package com.talkforum.talkforumserver.common.dto;

import com.sun.istack.NotNull;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(
    name = "InviteCodeDTO",
    description = "邀请码生成请求参数，包含生成数量、有效期和最大使用次数"
)
public class InviteCodeDTO {
    @Schema(
        description = "生成邀请码的数量，必须为正整数",
        example = "10",
        requiredMode = Schema.RequiredMode.REQUIRED,
        minimum = "1",
        maximum = "1000"
    )
    @NotNull
    private Integer count;  // 生成数量
    
    @Schema(
        description = "邀请码有效期天数，从生成时间开始计算",
        example = "30",
        requiredMode = Schema.RequiredMode.REQUIRED,
        minimum = "1",
        maximum = "365"
    )
    @NotNull
    private Integer expiredDays;  // 过期时间
    
    @Schema(
        description = "邀请码最大使用次数，表示每个邀请码可以被使用的次数",
        example = "1",
        requiredMode = Schema.RequiredMode.REQUIRED,
        minimum = "1",
        maximum = "10"
    )
    @NotNull
    private Integer maxCount;  // 最大使用次数
}
