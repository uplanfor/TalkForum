package com.talkforum.talkforumserver.report;

import com.talkforum.talkforumserver.common.entity.Report;
import com.talkforum.talkforumserver.common.vo.PageVO;

public interface ReportService {
    public void addReport(long userId, String reportType, String reportTargetType, Long reportTarget, String reason);
    public PageVO<Report> getReports(int page, int pageSize, String reportTargetType, String status);
    public void handleReports(String status, Long[] reportIds, long userId);
}
