package com.talkforum.talkforumserver.controller;

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
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 用户控制器
 * 处理用户相关的HTTP请求，包括注册、获取用户信息、更新用户资料、修改密码等
 */
@RestController
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
    @Validated
    public Result registerUser(@Valid @RequestBody UserDTO user) {
        return Result.success(I18n.t("user.register.success"), userService.registerUser(user));
    }

    /**
     * 根据用户ID获取用户详细信息
     * @param userId 用户ID
     * @return 用户详细信息
     */
    @GetMapping("/{userId}")
    public Result getUser(@PathVariable long userId) {
        return Result.success(I18n.t("user.get.success"), userService.getUserById(userId));
    }

    /**
     * 批量获取用户简单信息
     * @param userIds 用户ID数组
     * @return 用户简单信息列表
     */
    @GetMapping("/simple")
    public Result getSimpleUsersInfo(long[] userIds) {
        return Result.success(I18n.t("user.getSimple.success"), userService.getSimpleUsersInfo(userIds));
    }

    /**
     * 更新用户资料
     * @param user 用户资料DTO
     * @param token 登录凭证Token
     * @return 更新结果
     */
    @LoginRequired
    @PutMapping("/")
    @Validated
    public Result setUserProfile(@Valid @RequestBody UserProfileDTO user, @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token) {
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
    @LoginRequired
    @PutMapping("/changePassword")
    @Validated
    public Result changePassword(
            @RequestBody ChangePasswordDTO dto,
            @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token, HttpServletResponse httpServletResponse) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token); // 解析Token获取用户信息
        long userId = ((Number)(information.get("id"))).longValue(); // 获取用户ID
        userService.changePassword(userId, dto.getOldPassword(), dto.getNewPassword()); // 修改密码
        authService.logout(userId, httpServletResponse); // 退出登录，清除Cookie
        return Result.success(I18n.t("user.password.change.success"));
    }

    /**
     * 分页获取用户列表（需要版主权限）
     * @param page 页码
     * @param pageSize 每页大小
     * @return 用户列表
     */
   @ModeratorRequired
   @GetMapping("/admin")
   public Result getUsersByPage(int page, int pageSize) {
       return Result.success(I18n.t("user.admin.get.success"), userService.getUsersByPage( page, pageSize));
   }

    /**
     * 设置用户角色（需要管理员权限）
     * @param userId 用户ID
     * @param dto 角色DTO
     * @return 设置结果
     */
    @AdminRequired
    @PutMapping("/admin/{userId}/role")
    @Validated
    public Result setUserRole(@PathVariable long userId, @RequestBody UserRoleDTO dto) {
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
    @AdminRequired
    @PutMapping("/admin/{userId}/reset")
    public Result resetUserPassword(@PathVariable long userId) {
        userService.resetUserPassword(userId); // 重置用户密码
        authService.logout(userId);  // 使响应用户登出
        return Result.success(I18n.t("user.admin.password.reset.success", ServerConstant.DEFAULT_PASSWORD));
    }

    /**
     * 更新用户状态（需要版主权限）
     * @param userId 用户ID
     * @param dto 状态DTO
     * @return 更新结果
     */
    @ModeratorRequired
    @PutMapping("/admin/{userId}/status")
    @Validated
    public Result updateUserStatus(@PathVariable long userId, @RequestBody UserStatusDTO dto) {
        // 更新状态并踢出用户
         userService.updateStatus(userId, dto.getStatus());
         authService.logout(userId);
         return Result.success(I18n.t("user.admin.status.update.success"));
    }
}
