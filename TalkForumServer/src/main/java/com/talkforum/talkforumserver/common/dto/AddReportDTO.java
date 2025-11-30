package com.talkforum.talkforumserver.common.dto;


import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddReportDTO {
    @NotNull(message="Tell me the report type!")
    public String reportType;
    @NotNull(message="Tell me the report target type!")
    public String reportTargetType;
    @NotNull(message="tell me the report target")
    public Long reportTarget;

    public String reason;
}
