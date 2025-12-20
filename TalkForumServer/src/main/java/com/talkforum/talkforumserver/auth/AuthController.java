package com.talkforum.talkforumserver.auth;

import com.talkforum.talkforumserver.common.anno.LoginRequired;
import com.talkforum.talkforumserver.common.anno.ModeratorRequired;
import com.talkforum.talkforumserver.common.dto.LoginDTO;
import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.common.util.I18n;
import com.talkforum.talkforumserver.common.util.JWTHelper;
import com.talkforum.talkforumserver.common.vo.AuthVO;
import com.talkforum.talkforumserver.constant.ServerConstant;
import com.talkforum.talkforumserver.constant.UserConstant;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private AuthService authService;
    @Autowired
    private JWTHelper jwtHelper;

    @PostMapping("/login")
    public Result login(@RequestBody LoginDTO loginDTO, HttpServletResponse response) {
        return Result.success(I18n.t("auth.login.success"), authService.login(loginDTO, response));
    }


    @LoginRequired
    @PostMapping("/logout")
    public Result logout(@CookieValue(name = ServerConstant.LOGIN_COOKIE) String token, HttpServletResponse response) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token);
        long userId = ((Number)(information.get("id"))).longValue();
        authService.logout(userId, response);
        return Result.success(I18n.t("auth.logout.success"));
    }

    @LoginRequired
    @GetMapping("/")
    public Result auth(@CookieValue(name = ServerConstant.LOGIN_COOKIE) String token, HttpServletResponse response) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token);
        long userId = ((Number)(information.get("id"))).longValue();
        AuthVO result = authService.auth(userId, response);
        if (result == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return Result.error(I18n.t("auth.user.notfound"), result);
        }
        return Result.success(I18n.t("auth.information.update"), result);
    }


    @ModeratorRequired
    @GetMapping("/admin")
    public Result authAdmin(@CookieValue(name = ServerConstant.LOGIN_COOKIE) String token, HttpServletResponse response) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token);
        long userId = ((Number)(information.get("id"))).longValue();
        AuthVO result = authService.auth(userId, response);
        if (result == null || result.role.equals(UserConstant.ROLE_USER)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return Result.error(I18n.t("auth.admin.unauthorized"), result);
        }
        return Result.success(I18n.t("auth.admin.update.success"), result);
    }

    @ModeratorRequired
    @GetMapping("/admin/home")
    public Result getAdminHome(@CookieValue(name = ServerConstant.LOGIN_COOKIE) String token, HttpServletResponse response) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token);
        long userId = ((Number)(information.get("id"))).longValue();
        return Result.success(I18n.t("auth.admin.home.success"), authService.getAdminHomeInfo(userId, response));
    }
}
