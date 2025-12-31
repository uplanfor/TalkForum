package com.talkforum.talkforumserver.controller;

import com.sun.istack.NotNull;
import com.talkforum.talkforumserver.common.anno.LoginRequired;
import com.talkforum.talkforumserver.common.anno.ModeratorRequired;
import com.talkforum.talkforumserver.common.dto.AddReportDTO;
import com.talkforum.talkforumserver.common.dto.HandleReportDTO;
import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.common.util.I18n;
import com.talkforum.talkforumserver.common.util.JWTHelper;
import com.talkforum.talkforumserver.constant.ServerConstant;
import com.talkforum.talkforumserver.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RequestMapping("/reports")
@RestController
public class ReportController {
    @Autowired
    ReportService reportService;
    @Autowired
    JWTHelper jwtHelper;

    @PostMapping("/")
    @LoginRequired
    public Result addReport(@RequestBody AddReportDTO addReportDTO, @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token);
        long userId = ((Number)(information.get("id"))).longValue();
        reportService.addReport(userId, addReportDTO.reportType, addReportDTO.reportTargetType, addReportDTO.reportTarget, addReportDTO.reason);
        return Result.success(I18n.t("report.add.success"));
    }

    @GetMapping("/admin")
    @ModeratorRequired
    @Validated
    public Result getReports(@NotNull int page, @NotNull int pageSize, String reportTargetType, String status) {
        return Result.success(I18n.t("report.admin.get.success"), reportService.getReports(page, pageSize, reportTargetType, status));
    }


    @PutMapping("/admin")
    @ModeratorRequired
    @Validated
    public Result handleReports(@RequestBody HandleReportDTO handleReportDTO, @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token);
        long userId = ((Number)(information.get("id"))).longValue();
        reportService.handleReports(handleReportDTO.getStatus(), handleReportDTO.getReportIds(), userId);
        return Result.success(I18n.t("report.handle.success"));
    }
}
