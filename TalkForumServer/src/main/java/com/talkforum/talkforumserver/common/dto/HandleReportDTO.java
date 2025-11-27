package com.talkforum.talkforumserver.common.dto;

import com.sun.istack.NotNull;
import com.talkforum.talkforumserver.common.entity.Report;
import lombok.Data;

@Data
public class HandleReportDTO {
    @NotNull
    private String status;
    private Report[] reportIds;
}
