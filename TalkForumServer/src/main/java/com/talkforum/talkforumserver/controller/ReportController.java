package com.talkforum.talkforumserver.controller;

import com.sun.istack.NotNull;
import com.talkforum.talkforumserver.common.anno.LoginRequired;
import com.talkforum.talkforumserver.common.anno.ModeratorRequired;
import com.talkforum.talkforumserver.common.dto.AddReportDTO;
import com.talkforum.talkforumserver.common.dto.HandleReportDTO;
import com.talkforum.talkforumserver.common.entity.Report;
import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.common.util.I18n;
import com.talkforum.talkforumserver.common.util.JWTHelper;
import com.talkforum.talkforumserver.common.vo.PageVO;
import com.talkforum.talkforumserver.constant.ServerConstant;
import com.talkforum.talkforumserver.service.ReportService;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "举报管理")
@RequestMapping("/reports")
@RestController
@Validated
public class ReportController {
    @Autowired
    ReportService reportService;
    @Autowired
    JWTHelper jwtHelper;

    @PostMapping("/")
    @LoginRequired
    public Result<Object> addReport(
            @Valid @RequestBody AddReportDTO addReportDTO,
            @Parameter(description = "用户登录凭证Cookie") @CookieValue(name = ServerConstant.LOGIN_COOKIE)
            String token) {
        Map<String, Object> information = jwtHelper.parseJWT(token);
        long userId = ((Number)(information.get("id"))).longValue();
        reportService.addReport(userId, addReportDTO.reportType, addReportDTO.reportTargetType,
                addReportDTO.reportTarget, addReportDTO.reason);
        return Result.success(I18n.t("report.add.success"));
    }

    @GetMapping("/admin")
    @ModeratorRequired
    @Validated
    public Result<PageVO<Report>> getReports(
            @Parameter(description = "页码，分页查询参数，从1开始", example = "1", required = true) @NotNull int page,
            @Parameter(description = "每页显示的记录数量，分页查询参数", example = "20", required = true) @NotNull int pageSize,
            @Parameter(description = "举报目标类型，用于筛选不同类型的举报", example = "POST") String reportTargetType,
            @Parameter(description = "举报状态，用于筛选不同状态的举报", example = "PENDING") String status) {
        return Result.success(I18n.t("report.admin.get.success"),
                reportService.getReports(page, pageSize, reportTargetType, status));
    }


    @PutMapping("/admin")
    @ModeratorRequired
    @Validated
    public Result<Object> handleReports(
            @Valid @RequestBody HandleReportDTO handleReportDTO,
            @Parameter(description = "用户登录凭证Cookie") @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token) {
        Map<String, Object> information = jwtHelper.parseJWT(token);
        long userId = ((Number)(information.get("id"))).longValue();
        reportService.handleReports(handleReportDTO.getStatus(), handleReportDTO.getReportIds(), userId);
        return Result.success(I18n.t("report.handle.success"));
    }
}
