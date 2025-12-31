package com.talkforum.talkforumserver.common.dto;


import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(
        description = "举报时传递的参数组合"
)
public class AddReportDTO {
    @NotNull(message="Tell me the report type!")
    @Schema(
            description = "举报原因",
            example = "危害国家安全",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    public String reportType;

    @Schema(
            description = "举报目标类型",
            requiredMode = Schema.RequiredMode.REQUIRED,
            example = "POST",
            allowableValues = {"POST", "COMMENT", "USER"}
    )
    @NotNull(message="Tell me the report target type!")
    public String reportTargetType;

    @Schema(
            description = "举报目标id，为帖子id，评论id，用户id",
            requiredMode = Schema.RequiredMode.REQUIRED,
            example = "4674365"
    )
    @NotNull(message="tell me the report target")
    public Long reportTarget;

    @Schema(
            description = "(可选)举报理由",
            example = "太坏了!"
    )
    public String reason;
}
