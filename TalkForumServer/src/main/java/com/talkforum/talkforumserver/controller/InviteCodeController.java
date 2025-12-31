package com.talkforum.talkforumserver.controller;

import com.talkforum.talkforumserver.common.anno.AdminRequired;
import com.talkforum.talkforumserver.common.anno.LoginRequired;
import com.talkforum.talkforumserver.common.dto.DeleteInviteCodesDTO;
import com.talkforum.talkforumserver.common.dto.InviteCodeDTO;
import com.talkforum.talkforumserver.common.dto.UpdateInviteCodeDTO;
import com.talkforum.talkforumserver.common.entity.InviteCode;
import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.common.util.I18n;
import com.talkforum.talkforumserver.common.util.JWTHelper;
import com.talkforum.talkforumserver.constant.ServerConstant;
import com.talkforum.talkforumserver.service.InviteCodeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 邀请码控制器
 * 处理邀请码相关的HTTP请求，包括生成、获取、删除邀请码等
 */
@Tag(
    name = "邀请码管理",
    description = "邀请码相关接口，包括用户获取邀请码、管理员生成/修改/删除邀请码等功能，支持邀请码的批量操作"
)
@RequestMapping("/invitecode")
@RestController
public class InviteCodeController {
    @Autowired
    private JWTHelper jwtHelper; // JWT工具类，用于解析和生成Token
    @Autowired
    private InviteCodeService inviteCodeService; // 邀请码服务层

    /**
     * 获取用户的邀请码列表
     * @param token 登录凭证Token
     * @return 邀请码列表
     */
    @Operation(
        summary = "获取用户邀请码列表",
        description = "获取当前登录用户的所有邀请码列表，包括邀请码状态、使用次数等信息"
    )
    @LoginRequired
    @GetMapping("/")
    public Result getInviteCodes(
        @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token);
        Long userId = ((Number)(information.get("id"))).longValue();
        return Result.success(I18n.t("invitecode.get.success"), inviteCodeService.getInviteCodes(userId));
    }

    /**
     * 管理员获取所有邀请码列表
     * @param page 页码
     * @param pageSize 每页大小
     * @return 邀请码分页列表
     */
    @Operation(
        summary = "管理员获取邀请码列表",
        description = "管理员获取系统中所有邀请码的分页列表，支持分页查询"
    )
    @AdminRequired
    @GetMapping("/admin")
    public Result adminGetInviteCodes(
            int page,
            int pageSize) {
        return Result.success(I18n.t("invitecode.admin.get.success"), inviteCodeService.adminGetInviteCodes(page, pageSize));
    }

    /**
     * 生成邀请码
     * 管理员可以生成指定数量、有效期和最大使用次数的邀请码
     * @param token 登录凭证Token
     * @param inviteCodeDTO 邀请码生成DTO
     * @return 生成的邀请码列表
     */
    @Operation(
        summary = "管理员生成邀请码",
        description = "管理员生成指定数量、有效期和最大使用次数的邀请码，支持批量生成"
    )
    @AdminRequired
    @PostMapping("/admin")
    public Result generateInviteCodes(
            @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token,
            @RequestBody InviteCodeDTO inviteCodeDTO) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token);
        Long userId = ((Number)(information.get("id"))).longValue();
        List<InviteCode> codes = inviteCodeService.generateInviteCodes(userId, inviteCodeDTO);

        return Result.success(I18n.t("invitecode.generate.success", codes.size()),
               codes);
    }

    /**
     * 删除邀请码（似乎废弃了呢）
     * @param code 邀请码
     * @return 删除结果
     */
    @Operation(
        summary = "删除单个邀请码（已废弃）",
        description = "删除指定的单个邀请码，此方法已废弃，建议使用批量删除接口"
    )
    @AdminRequired
    @DeleteMapping("/admin/{code}")
    public Result deleteInviteCode(
            @PathVariable String code) {
        boolean success = inviteCodeService.deleteInviteCode(code);
        return success ? 
            Result.success(I18n.t("invitecode.delete.success")) :
            Result.error(I18n.t("invitecode.delete.failed"));
    }
    
    /**
     * 修改邀请码
     * @param updateInviteCodeDTO 修改邀请码DTO
     * @return 修改结果
     */
    @Operation(
        summary = "管理员修改邀请码",
        description = "管理员批量修改邀请码的有效期或最大使用次数，支持批量操作"
    )
    @AdminRequired
    @PutMapping("/admin")
    public Result updateInviteCodes(
            @RequestBody UpdateInviteCodeDTO updateInviteCodeDTO) {
        int updatedCount = inviteCodeService.updateInviteCodes(updateInviteCodeDTO);
        return updatedCount > 0 ? 
            Result.success(I18n.t("invitecode.update.success", updatedCount)) :
            Result.error(I18n.t("invitecode.update.failed"));
    }
    
    /**
     * 批量删除邀请码
     * @param deleteInviteCodesDTO 删除邀请码DTO
     * @return 删除结果
     */
    @Operation(
        summary = "管理员批量删除邀请码",
        description = "管理员批量删除指定的邀请码，支持一次性删除多个邀请码"
    )
    @AdminRequired
    @DeleteMapping("/admin")
    public Result deleteInviteCodes(
            DeleteInviteCodesDTO deleteInviteCodesDTO) {
        int count = inviteCodeService.deleteInviteCodes(deleteInviteCodesDTO);
        return  Result.success(I18n.t("invitecode.batchDelete.success", count));
    }
}
