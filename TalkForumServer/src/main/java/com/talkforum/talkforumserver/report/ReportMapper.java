package com.talkforum.talkforumserver.report;

import com.talkforum.talkforumserver.common.entity.Report;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ReportMapper {
    List<Report> getReports(int page, int pageSize, String reportTargetType, String status);

    long countReports(String reportTargetType, String status);

    void handleReports(String status, Report[] reportIds, long userId);

    void addReport(long userId, String reportType, String reportTargetType, Long reportTarget, String reason);
}
