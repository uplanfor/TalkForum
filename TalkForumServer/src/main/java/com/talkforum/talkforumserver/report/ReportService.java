package com.talkforum.talkforumserver.report;

import com.sun.istack.NotNull;
import com.talkforum.talkforumserver.common.entity.Report;
import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.common.vo.ReportListVO;

import java.util.List;

public interface ReportService {
    public void addReport(String reportType, String reportTargetType, Long reportTarget, String reason);
    public ReportListVO getReports(int page, int pageSize, String target, String reportTargetType);

    public void handleReports(String status, Report[] reportIds, long userId);
}
