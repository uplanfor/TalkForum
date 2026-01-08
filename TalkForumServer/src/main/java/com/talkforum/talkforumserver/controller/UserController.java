package com.talkforum.talkforumserver.controller;

import com.talkforum.talkforumserver.common.vo.PageVO;
import com.talkforum.talkforumserver.common.vo.SimpleUserVO;
import com.talkforum.talkforumserver.common.vo.UserVO;
import com.talkforum.talkforumserver.service.AuthService;
import com.talkforum.talkforumserver.common.anno.AdminRequired;
import com.talkforum.talkforumserver.common.anno.LoginRequired;
import com.talkforum.talkforumserver.common.anno.ModeratorRequired;
import com.talkforum.talkforumserver.common.dto.*;
import com.talkforum.talkforumserver.common.exception.BusinessRuntimeException;
import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.common.util.I18n;
import com.talkforum.talkforumserver.common.util.JWTHelper;
import com.talkforum.talkforumserver.constant.ServerConstant;
import com.talkforum.talkforumserver.constant.UserConstant;
import com.talkforum.talkforumserver.service.UserService;
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

import java.util.List;
import java.util.Map;

/**
 * 用户控制器
 * 处理用户相关的HTTP请求，包括注册、获取用户信息、更新用户资料、修改密码等
 */
@Tag(name = "用户管理")
@RestController
@Validated
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserService userService; // 用户服务层

    @Autowired
    private JWTHelper jwtHelper; // JWT工具类，用于解析和生成Token
    @Autowired
    private AuthService authService; // 认证服务层

    /**
     * 用户注册接口
     * 处理用户注册请求，需要提供有效的邀请码才能完成注册
     * @param user 用户注册信息DTO，包含邮箱、密码、用户名和邀请码
     * @return 注册结果，包含注册成功的用户信息
     * @throws BusinessRuntimeException 当邀请码无效、不存在或已过期时抛出
     */
    @PostMapping("/")
    public Result<UserVO> registerUser(@Valid @RequestBody UserRegisterDTO user) {
        return Result.success(I18n.t("user.register.success"), userService.registerUser(user));
    }

    /**
     * 根据用户ID获取用户详细信息
     * @param userId 用户ID
     * @return 用户详细信息
     */
    @Operation(
        summary = "获取用户详情",
        description = "根据用户ID获取用户详细信息，包括基本资料、统计信息等"
    )
    @ApiResponse(
        responseCode = "200",
        description = "请求成功",
        content = @Content(
            mediaType = "application/json",
            schema = @Schema(implementation = Result.class, subTypes = UserVO.class)
        )
    )
    @GetMapping("/{userId}")
    public Result<UserVO> getUser(
        @Parameter(description = "用户ID", example = "1234567890", required = true) @PathVariable long userId) {
        return Result.success(I18n.t("user.get.success"), userService.getUserById(userId));
    }

    /**
     * 批量获取用户简单信息
     * @param userIds 用户ID数组
     * @return 用户简单信息列表
     */
    @Operation(
        summary = "批量获取用户简单信息",
        description = "批量获取用户的简单信息，包括ID、用户名、头像等基本信息"
    )
    @ApiResponse(
        responseCode = "200",
        description = "请求成功",
        content = @Content(
            mediaType = "application/json",
            schema = @Schema(implementation = Result.class, subTypes = {List.class, SimpleUserVO.class})
        )
    )
    @GetMapping("/simple")
    public Result<List<SimpleUserVO>> getSimpleUsersInfo(
        @Parameter(description = "用户ID数组，用于批量获取用户信息", example = "[1234567890, 1234567891, 1234567892]", required = true)
        long[] userIds) {
        return Result.success(I18n.t("user.getSimple.success"), userService.getSimpleUsersInfo(userIds));
    }

    /**
     * 更新用户资料
     * @param user 用户资料DTO
     * @param token 登录凭证Token
     * @return 更新结果
     */
    @Operation(
        summary = "更新用户资料",
        description = "用户更新自己的个人资料，包括昵称、头像等信息，需要登录权限"
    )
    @ApiResponse(
        responseCode = "200",
        description = "请求成功",
        content = @Content(
            mediaType = "application/json",
            schema = @Schema(implementation = Result.class)
        )
    )
    @LoginRequired
    @PutMapping("/")
    public Result<Object> setUserProfile(
        @Valid @RequestBody UserProfileDTO user, 
        @Parameter(description = "用户登录凭证Cookie") @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token); // 解析Token获取用户信息
        user.id = ((Number)(information.get("id"))).longValue(); // 设置用户ID
        userService.setUserProfile(user); // 更新用户资料
        return  Result.success(I18n.t("user.profile.update.success"));
    }

    /**
     * 修改用户密码
     * @param dto 密码修改DTO
     * @param token 登录凭证Token
     * @param httpServletResponse HTTP响应对象，用于清除Cookie
     * @return 修改结果
     */
    @Operation(
        summary = "修改用户密码",
        description = "用户修改自己的登录密码，修改成功后需要重新登录，需要登录权限"
    )
    @ApiResponse(
        responseCode = "200",
        description = "请求成功",
        content = @Content(
            mediaType = "application/json",
            schema = @Schema(implementation = Result.class)
        )
    )
    @LoginRequired
    @PutMapping("/changePassword")
    @Validated
    public Result<Object> changePassword(
            @Parameter(description = "修改密码的请求参数", required = true) @Valid @RequestBody ChangePasswordDTO dto,
            @Parameter(description = "用户登录凭证Cookie")  @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token,
            @Parameter(description = "HTTP响应对象，用于清除Cookie", hidden = true) HttpServletResponse httpServletResponse) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token); // 解析Token获取用户信息
        long userId = ((Number)(information.get("id"))).longValue(); // 获取用户ID
        userService.changePassword(userId, dto.getOldPassword(), dto.getNewPassword()); // 修改密码
        return Result.success(I18n.t("user.password.change.success"));
    }

    /**
     * 分页获取用户列表（需要版主权限）
     * @param page 页码
     * @param pageSize 每页大小
     * @return 用户列表
     */
    @Operation(
        summary = "管理员获取用户列表",
        description = "管理员分页获取系统中的用户列表，需要管理员或版主权限"
    )
    @ApiResponse(
        responseCode = "200",
        description = "请求成功",
        content = @Content(
            mediaType = "application/json",
            schema = @Schema(implementation = Result.class, subTypes = PageVO.class)
        )
    )
    @ModeratorRequired
    @GetMapping("/admin")
    public Result<PageVO<UserVO>> getUsersByPage(
           @Parameter(description = "页码，从1开始", example = "1", required = true) int page,
           @Parameter(description = "每页显示的用户数量", example = "20", required = true) int pageSize) {
       return Result.success(I18n.t("user.admin.get.success"), userService.getUsersByPage( page, pageSize));
   }

    /**
     * 设置用户角色（需要管理员权限）
     * @param userId 用户ID
     * @param dto 角色DTO
     * @return 设置结果
     */
    @Operation(
        summary = "管理员设置用户角色",
        description = "管理员设置用户的角色（用户或版主），需要管理员权限"
    )
    @ApiResponse(
        responseCode = "200",
        description = "请求成功",
        content = @Content(
            mediaType = "application/json",
            schema = @Schema(implementation = Result.class)
        )
    )
    @AdminRequired
    @PutMapping("/admin/{userId}/role")
    @Validated
    public Result<Object> setUserRole(
            @Parameter(description = "用户ID", example = "1234567890", required = true) @PathVariable long userId,
            @Parameter(description = "角色设置请求参数", required = true) @RequestBody UserRoleDTO dto) {
        String role = dto.getRole();
        // 验证角色是否合法
        if (!UserConstant.ROLE_MODERATOR.equals(role) && !UserConstant.ROLE_USER.equals(role)) {
            throw new BusinessRuntimeException(I18n.t("user.role.unknown"));
        }
        userService.setUserRole(userId, dto.getRole()); // 设置用户角色
        return Result.success(I18n.t("user.admin.role.change.success"));
    }

    /**
     * 重置用户密码（需要管理员权限）
     * @param userId 用户ID
     * @return 重置结果
     */
    @Operation(
        summary = "管理员重置用户密码",
        description = "管理员重置用户密码为默认密码，并强制用户重新登录，需要管理员权限"
    )
    @ApiResponse(
        responseCode = "200",
        description = "请求成功",
        content = @Content(
            mediaType = "application/json",
            schema = @Schema(implementation = Result.class)
        )
    )
    @AdminRequired
    @PutMapping("/admin/{userId}/reset")
    public Result<Object> resetUserPassword(
            @Parameter(description = "用户ID", example = "1234567890", required = true) @PathVariable long userId) {
        userService.resetUserPassword(userId);
        return Result.success(I18n.t("user.admin.password.reset.success", ServerConstant.DEFAULT_PASSWORD));
    }

    /**
     * 更新用户状态（需要版主权限）
     * @param userId 用户ID
     * @param dto 状态DTO
     * @return 更新结果
     */
    @Operation(
        summary = "管理员更新用户状态",
        description = "管理员更新用户状态（正常、禁用等），并强制用户重新登录，需要管理员或版主权限"
    )
    @ApiResponse(
        responseCode = "200",
        description = "请求成功",
        content = @Content(
            mediaType = "application/json",
            schema = @Schema(implementation = Result.class)
        )
    )
    @ModeratorRequired
    @PutMapping("/admin/{userId}/status")
    @Validated
    public Result<Object> updateUserStatus(
            @CookieValue(name = ServerConstant.LOGIN_COOKIE, required = true) String token,
            @Parameter(description = "用户ID", example = "1234567890", required = true) @PathVariable long userId,
            @Parameter(description = "状态更新请求参数", required = true) @RequestBody UserStatusDTO dto) {
        Map<String, Object> map = jwtHelper.parseJWTToken(token);
        String role = (String) map.get("role");
        // 更新状态并踢出用户
        if (userService.updateStatus(role, userId, dto.getStatus())) {
            authService.logout(userId);
            return Result.success(I18n.t("user.admin.status.update.success"), dto.getStatus());
        } else {
            return Result.error(I18n.t("user.admin.status.update.failure"));
        }
    }
}
