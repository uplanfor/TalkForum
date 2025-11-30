package com.talkforum.talkforumserver.common.dto;

import com.talkforum.talkforumserver.common.entity.Report;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class HandleReportDTO {
    @NotNull(message="You must point on how your deal with the report![post expected]")
    private String status;
    private Report[] reportIds;
}
