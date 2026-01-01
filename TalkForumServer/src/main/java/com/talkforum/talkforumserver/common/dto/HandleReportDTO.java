package com.talkforum.talkforumserver.common.dto;

import com.talkforum.talkforumserver.common.entity.Report;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(
        description = "批量处理举报的请求参数"
)
public class HandleReportDTO {
    @Schema(
            description = "举报审核的状态"
    )
    @NotNull(message="You must point on how your deal with the report![post expected]")
    private String status;
    @Schema(
            description = "处理举报的举报id列表",
            example = "[1, 2]"
    )
    private Long[] reportIds;
}
