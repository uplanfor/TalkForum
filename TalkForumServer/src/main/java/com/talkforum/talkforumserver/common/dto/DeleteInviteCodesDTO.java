package com.talkforum.talkforumserver.common.dto;

import com.sun.istack.NotNull;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

@Data
@Schema(
    name = "DeleteInviteCodesDTO",
    description = "批量删除邀请码请求参数，包含待删除的邀请码列表"
)
public class DeleteInviteCodesDTO {
    @Schema(
        description = "待删除的邀请码列表，支持批量删除",
        example = "[\"ABC123\", \"DEF456\", \"GHI789\"]",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotNull
    private List<String> codes;
}