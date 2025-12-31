package com.talkforum.talkforumserver.common.dto;

import com.sun.istack.NotNull;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
@Schema(
    name = "UpdateInviteCodeDTO",
    description = "邀请码修改请求参数，支持批量修改邀请码的有效期和最大使用次数"
)
public class UpdateInviteCodeDTO {
    @Schema(
        description = "待修改的邀请码列表，支持批量修改",
        example = "[\"ABC123\", \"DEF456\", \"GHI789\"]",
        requiredMode = Schema.RequiredMode.REQUIRED,
        minLength = 1,
        maxLength = 100
    )
    @NotNull
    private List<String> codes;
    
    @Schema(
        description = "新的最大使用次数，可选参数，不修改时留空",
        example = "5",
        nullable = true,
        minimum = "1",
        maximum = "100"
    )
    private Integer maxCount;
    
    @Schema(
        description = "新的有效期天数，从当前时间开始计算，可选参数，不修改时留空",
        example = "60",
        nullable = true,
        minimum = "1",
        maximum = "365"
    )
    private Integer expiredDays;

    // 被修改
    @Schema(
        description = "新的过期时间，系统自动计算，无需手动设置",
        hidden = true
    )
    private Date expiredAt;
}