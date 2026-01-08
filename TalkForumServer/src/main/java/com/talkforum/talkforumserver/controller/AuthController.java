package com.talkforum.talkforumserver.controller;

import com.talkforum.talkforumserver.common.vo.AdminHomeVO;
import com.talkforum.talkforumserver.service.AuthService;
import com.talkforum.talkforumserver.common.anno.LoginRequired;
import com.talkforum.talkforumserver.common.anno.ModeratorRequired;
import com.talkforum.talkforumserver.common.dto.LoginDTO;
import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.common.util.I18n;
import com.talkforum.talkforumserver.common.util.JWTHelper;
import com.talkforum.talkforumserver.common.vo.AuthVO;
import com.talkforum.talkforumserver.constant.ServerConstant;
import com.talkforum.talkforumserver.constant.UserConstant;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@Validated
@Tag(name="认证管理")
@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private AuthService authService;
    @Autowired
    private JWTHelper jwtHelper;

    @Operation(summary = "请求登录")
    @ApiResponse(
            responseCode = "200",
            description = "请求成功，返回用户信息",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(
                            implementation = Result.class,
                            subTypes = AuthVO.class
                    )
            )
    )
    @PostMapping("/login")
    public Result<AuthVO> login(
            @RequestBody @Valid LoginDTO loginDTO,
            HttpServletResponse response) {
        return Result.success(I18n.t("auth.login.success"), authService.login(loginDTO, response));
    }


    @Operation(summary = "请求登出")
    @LoginRequired
    @PostMapping("/logout")
    public Result<Object> logout(
            @Parameter(description = "登录token，用于解析登录情况") @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token,
            HttpServletResponse response) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token);
        long userId = ((Number)(information.get("id"))).longValue();
        authService.logout(userId, response);
        return Result.success(I18n.t("auth.logout.success"));
    }

    @Operation(summary = "获取此时是否登录")
    @ApiResponse(
            responseCode = "200",
            description = "请求成功，返回用户信息",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(
                            implementation = Result.class,
                            subTypes = {AuthVO.class}
                    )
            )
    )
    @LoginRequired
    @GetMapping("/")
    public Result<AuthVO> auth(
            @Parameter(description = "登录token，用于解析登录情况") @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token,
            HttpServletResponse response) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token);
        long userId = ((Number)(information.get("id"))).longValue();
        AuthVO authVO = authService.auth(userId, response);
        if (authVO == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return Result.error(I18n.t("auth.user.notfound"));
        }
        return Result.success(I18n.t("auth.information.update"), authVO);
    }


    @Operation(summary = "获取此时是否管理员登录")
    @ApiResponse(
            responseCode = "200",
            description = "请求成功，返回用户信息",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(
                            implementation = Result.class,
                            subTypes = {AuthVO.class}
                    )
            )
    )
    @ModeratorRequired
    @GetMapping("/admin")
    public Result<AuthVO> authAdmin(
            @Parameter(description = "登录token，用于解析登录情况") @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token,
            HttpServletResponse response) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token);
        long userId = ((Number)(information.get("id"))).longValue();
        AuthVO authVO = authService.auth(userId, response);
        if (authVO == null || authVO.getRole().equals(UserConstant.ROLE_USER)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return Result.error(I18n.t("auth.admin.unauthorized"), authVO);
        }
        return Result.success(I18n.t("auth.admin.update.success"), authVO);
    }

    @Operation(summary = "获取管理员HOME页面信息")
    @ApiResponse(
            responseCode = "200",
            description = "请求成功，返回用户信息",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(
                            implementation = Result.class,
                            subTypes = {AdminHomeVO.class}
                    )
            )
    )
    @ModeratorRequired
    @GetMapping("/admin/home")
    public Result<AdminHomeVO> getAdminHome(
            @Parameter(description = "登录token，用于解析登录情况") @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token,
            HttpServletResponse response) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token);
        long userId = ((Number)(information.get("id"))).longValue();
        return Result.success(I18n.t("auth.admin.home.success"), authService.getAdminHomeInfo(userId, response));
    }
}
