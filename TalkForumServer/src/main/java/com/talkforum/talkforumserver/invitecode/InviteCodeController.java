package com.talkforum.talkforumserver.invitecode;


import com.talkforum.talkforumserver.common.anno.AdminRequired;
import com.talkforum.talkforumserver.common.anno.LoginRequired;
import com.talkforum.talkforumserver.common.dto.DeleteInviteCodesDTO;
import com.talkforum.talkforumserver.common.dto.InviteCodeDTO;
import com.talkforum.talkforumserver.common.dto.UpdateInviteCodeDTO;
import com.talkforum.talkforumserver.common.entity.InviteCode;
import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.common.util.JWTHelper;
import com.talkforum.talkforumserver.common.vo.PageVO;
import com.talkforum.talkforumserver.constant.ServerConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 邀请码控制器
 * 处理邀请码相关的HTTP请求，包括生成、获取、删除邀请码等
 */
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
    @LoginRequired
    @GetMapping("/")
    public Result getInviteCodes(@CookieValue(name = ServerConstant.LOGIN_COOKIE) String token) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token);
        Long userId = ((Number)(information.get("id"))).longValue();
        return Result.success("Success to get invite code!", inviteCodeService.getInviteCodes(userId));
    }

    /**
     * 管理员获取所有邀请码列表
     * @param page 页码
     * @param pageSize 每页大小
     * @return 邀请码分页列表
     */
    @AdminRequired
    @GetMapping("/admin")
    public Result adminGetInviteCodes(int page, int pageSize) {
        return Result.success("Success to get invite codes!", inviteCodeService.adminGetInviteCodes(page, pageSize));
    }

    /**
     * 生成邀请码
     * 管理员可以生成指定数量、有效期和最大使用次数的邀请码
     * @param token 登录凭证Token
     * @param inviteCodeDTO 邀请码生成DTO
     * @return 生成的邀请码列表
     */
    @AdminRequired
    @PostMapping("/admin")
    public Result generateInviteCodes(@CookieValue(name = ServerConstant.LOGIN_COOKIE) String token, @RequestBody InviteCodeDTO inviteCodeDTO) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token);
        Long userId = ((Number)(information.get("id"))).longValue();
        List<InviteCode> codes = inviteCodeService.generateInviteCodes(userId, inviteCodeDTO);

        return Result.success("Success to generate " + codes.size() + " invite codes!",
               codes);
    }

    /**
     * 删除邀请码（似乎废弃了呢）
     * @param code 邀请码
     * @return 删除结果
     */
    @AdminRequired
    @DeleteMapping("/admin/{code}")
    public Result deleteInviteCode(@PathVariable String code) {
        boolean success = inviteCodeService.deleteInviteCode(code);
        return success ? 
            Result.success("Invite code deleted successfully") :
            Result.error("Failed to delete invite code");
    }
    
    /**
     * 修改邀请码
     * @param updateInviteCodeDTO 修改邀请码DTO
     * @return 修改结果
     */
    @AdminRequired
    @PutMapping("/admin")
    public Result updateInviteCodes(@RequestBody UpdateInviteCodeDTO updateInviteCodeDTO) {
        int updatedCount = inviteCodeService.updateInviteCodes(updateInviteCodeDTO);
        return updatedCount > 0 ? 
            Result.success("Invite code updated successfully, updated count: " + updatedCount) :
            Result.error("Failed to update invite code");
    }
    
    /**
     * 批量删除邀请码
     * @param deleteInviteCodesDTO 删除邀请码DTO
     * @return 删除结果
     */
    @AdminRequired
    @DeleteMapping("/admin")
    public Result deleteInviteCodes(DeleteInviteCodesDTO deleteInviteCodesDTO) {
        int count = inviteCodeService.deleteInviteCodes(deleteInviteCodesDTO);
        return  Result.success("Success to delete " + count + "invite codes!");
    }
}
