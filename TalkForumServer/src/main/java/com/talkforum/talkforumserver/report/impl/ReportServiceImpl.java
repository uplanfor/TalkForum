package com.talkforum.talkforumserver.report.impl;

import com.talkforum.talkforumserver.common.entity.Report;
import com.talkforum.talkforumserver.common.vo.PageVO;
import com.talkforum.talkforumserver.report.ReportMapper;
import com.talkforum.talkforumserver.report.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(rollbackFor = Exception.class)
public class ReportServiceImpl implements ReportService {
    @Autowired
    private ReportMapper reportMapper;

    @Override
    public void addReport(long userId, String reportType, String reportTargetType, Long reportTarget, String reason) {
        reportMapper.addReport(userId, reportType, reportTargetType, reportTarget, reason);
    }

    @Override
    public PageVO<Report> getReports(int page, int pageSize, String reportTargetType, String status) {
        int offset = (page - 1) * pageSize;
        List<Report> reports = reportMapper.getReports(page, pageSize, reportTargetType, status);
        return new PageVO<>(reports, reportMapper.countReports(reportTargetType, status));
    }

    @Override
    public void handleReports(String status, Report[] reportIds, long userId) {
        reportMapper.handleReports(status, reportIds, userId);
    }


}
