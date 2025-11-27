package com.talkforum.talkforumserver.common.dto;

import com.sun.istack.NotNull;
import lombok.Data;

@Data
public class AddReportDTO {
    @NotNull
    public String reportType;
    @NotNull
    public String reportTargetType;
    @NotNull
    public Long reportTarget;

    public String reason;
}
