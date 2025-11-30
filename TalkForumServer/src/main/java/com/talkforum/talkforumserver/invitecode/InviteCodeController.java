package com.talkforum.talkforumserver.invitecode;


import com.talkforum.talkforumserver.common.anno.AdminRequired;
import com.talkforum.talkforumserver.common.anno.LoginRequired;
import com.talkforum.talkforumserver.common.dto.InviteCodeDTO;
import com.talkforum.talkforumserver.common.entity.InviteCode;
import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.common.util.JWTHelper;
import com.talkforum.talkforumserver.constant.ServerConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RequestMapping("/invitecode")
@RestController
public class InviteCodeController {
    @Autowired
    private JWTHelper jwtHelper;
    @Autowired
    private InviteCodeService inviteCodeService;

    @LoginRequired
    @GetMapping("/")
    public Result getInviteCodes(@CookieValue(name = ServerConstant.LOGIN_COOKIE) String token) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token);
        Long userId = ((Number)(information.get("id"))).longValue();
        return Result.success("Success to get invite code!", inviteCodeService.getInviteCodes(userId));
    }

    @AdminRequired
    @GetMapping("/admin")
    public Result adminGetInviteCodes(int page, int pageSize) {
        return Result.success("Success to get invite codes!", inviteCodeService.adminGetInviteCodes(page, pageSize));
    }

    @AdminRequired
    @PostMapping("/admin")
    public Result generateInviteCodes(@CookieValue(name = ServerConstant.LOGIN_COOKIE) String token, @RequestBody InviteCodeDTO inviteCodeDTO) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token);
        Long userId = ((Number)(information.get("id"))).longValue();
        return Result.success("Success to generate invite codes!", inviteCodeService.generateInviteCodes(userId, inviteCodeDTO));
    }

    @AdminRequired
    @DeleteMapping("/admin/{code}")
    public Result deleteInviteCode(@PathVariable String code) {
        boolean success = inviteCodeService.deleteInviteCode(code);
        return success ? 
            Result.success("Invite code deleted successfully") :
            Result.error("Failed to delete invite code");
    }
}
