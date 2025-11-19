package com.talkforum.talkforumserver.user;

import com.talkforum.talkforumserver.auth.AuthService;
import com.talkforum.talkforumserver.common.anno.AdminRequired;
import com.talkforum.talkforumserver.common.anno.LoginRequired;
import com.talkforum.talkforumserver.common.dto.*;
import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.common.util.JWTHelper;
import com.talkforum.talkforumserver.constant.ServerConstant;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/user")
public class UserController {
    @Autowired
    private UserService userService;

    @Autowired
    private JWTHelper jwtHelper;
    @Autowired
    private AuthService authService;

    @PostMapping("/")
    public Result registerUser(@RequestBody UserDTO user) {
        return Result.success("Sign up successfully", userService.registerUser(user));
    }

    @GetMapping("/{userId}")
    public Result getUser(@PathVariable long userId) {
        return Result.success("Success to get user information", userService.getUserById(userId));
    }

    @LoginRequired
    @PutMapping("/")
    public Result setUserProfile(@RequestBody UserProfileDTO user, @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token);
        user.id = ((Number)(information.get("id"))).longValue();
        userService.setUserProfile(user);
        return  Result.success("Success to edit user profile!");
    }

    @LoginRequired
    @PutMapping("/changePassword")
    public Result changePassword(
            @RequestBody ChangePasswordDTO dto,
            @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token, HttpServletResponse httpServletResponse) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token);
        long userId = ((Number)(information.get("id"))).longValue();
        userService.changePassword(userId, dto.getOldPassword(), dto.getNewPassword());
        authService.logout(token, httpServletResponse);
        return Result.success("Success to change password!");
    }

//    @AdminRequired
//    @GetMapping("/admin/")
//    public Result getUsers(int page, int pageSize) {
//        // TODO:实现getUsers
//        return Result.success("Success to get users!", userService.getUsers(page, pageSize));
//    }

    @AdminRequired
    @PutMapping("/admin/{userId}/role")
    public Result setUserRole(@PathVariable long userId, @RequestBody UserRoleDTO dto) {
        userService.setUserRole(userId, dto.getRole());
        return Result.success("Success to change role!");
    }

    @AdminRequired
    @PutMapping("/admin/{userId}/reset")
    public Result resetUserPassword(@PathVariable long userId) {
        userService.resetUserPassword(userId);
        return Result.success("Success to reset password!");
    }

    @AdminRequired
    @PutMapping("/{userId}/status")
    public Result updateUserStatus(@PathVariable long userId, @RequestBody UserStatusDTO dto) {
         userService.updateStatus(userId, dto.getStatus());
         return Result.success("Success to update user status!");
    }
}
