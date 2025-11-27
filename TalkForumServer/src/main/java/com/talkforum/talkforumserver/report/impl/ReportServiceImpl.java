package com.talkforum.talkforumserver.report.impl;

import com.talkforum.talkforumserver.common.entity.Report;
import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.common.vo.ReportListVO;
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
    public void addReport(String reportType, String reportTargetType, Long reportTarget, String reason) {

    }

    @Override
    public ReportListVO getReports(int page, int pageSize, String target, String reportTargetType) {
        return null;
    }

    @Override
    public void handleReports(String status, Report[] reportIds, long userId) {}


}
