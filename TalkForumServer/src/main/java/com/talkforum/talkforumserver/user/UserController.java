package com.talkforum.talkforumserver.user;

import com.sun.istack.NotNull;
import com.talkforum.talkforumserver.auth.AuthService;
import com.talkforum.talkforumserver.common.anno.AdminRequired;
import com.talkforum.talkforumserver.common.anno.LoginRequired;
import com.talkforum.talkforumserver.common.anno.ModeratorRequired;
import com.talkforum.talkforumserver.common.dto.*;
import com.talkforum.talkforumserver.common.exception.BusinessRuntimeException;
import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.common.util.JWTHelper;
import com.talkforum.talkforumserver.constant.ServerConstant;
import com.talkforum.talkforumserver.constant.UserConstant;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserService userService;

    @Autowired
    private JWTHelper jwtHelper;
    @Autowired
    private AuthService authService;

    @PostMapping("/")
    @Validated
    public Result registerUser(@Valid @RequestBody UserDTO user) {
        return Result.success("Sign up successfully", userService.registerUser(user));
    }

    @GetMapping("/{userId}")
    public Result getUser(@PathVariable long userId) {
        return Result.success("Success to get user information", userService.getUserById(userId));
    }

    @GetMapping("/simple")
    public Result getSimpleUsersInfo(long[] userIds) {
        return Result.success("Success to get user simple information", userService.getSimpleUsersInfo(userIds));
    }

    @LoginRequired
    @PutMapping("/")
    @Validated
    public Result setUserProfile(@Valid @RequestBody UserProfileDTO user, @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token);
        user.id = ((Number)(information.get("id"))).longValue();
        userService.setUserProfile(user);
        return  Result.success("Success to edit user profile!");
    }

    @LoginRequired
    @PutMapping("/changePassword")
    @Validated
    public Result changePassword(
            @RequestBody ChangePasswordDTO dto,
            @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token, HttpServletResponse httpServletResponse) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token);
        long userId = ((Number)(information.get("id"))).longValue();
        userService.changePassword(userId, dto.getOldPassword(), dto.getNewPassword());
        authService.logout(userId, httpServletResponse);
        return Result.success("Success to change password!");
    }

   @ModeratorRequired
   @GetMapping("/admin/")
   public Result getUsersByPage(int page, int pageSize) {
       return Result.success("Success to get users!", userService.getUsersByPage( page, pageSize));
   }

    @AdminRequired
    @PutMapping("/admin/{userId}/role")
    @Validated
    public Result setUserRole(@PathVariable long userId, @RequestBody UserRoleDTO dto) {
        String role = dto.getRole();
        if (!UserConstant.ROLE_MODERATOR.equals(role) && !UserConstant.ROLE_ADMIN.equals(role)) {
            throw new BusinessRuntimeException("Unknown role!");
        }
        userService.setUserRole(userId, dto.getRole());
        return Result.success("Success to change role!");
    }

    @AdminRequired
    @PutMapping("/admin/{userId}/reset")
    public Result resetUserPassword(@PathVariable long userId) {
        userService.resetUserPassword(userId);
        return Result.success("Success to reset password! Default password is " + ServerConstant.DEFAULT_PASSWORD);
    }

    @ModeratorRequired
    @PutMapping("/admin/{userId}/status")
    @Validated
    public Result updateUserStatus(@PathVariable long userId, @RequestBody UserStatusDTO dto) {
         userService.updateStatus(userId, dto.getStatus());
         return Result.success("Success to update user status!");
    }
}
