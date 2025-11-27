package com.talkforum.talkforumserver.common.vo;

import com.talkforum.talkforumserver.common.entity.Report;
import lombok.Data;

import java.util.List;

@Data
public class ReportListVO {
    private List<Report> data;
    private long total;
}
