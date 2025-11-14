package com.talkforum.talkforumserver.user;

import com.talkforum.talkforumserver.common.anno.AdminRequired;
import com.talkforum.talkforumserver.common.anno.LoginRequired;
import com.talkforum.talkforumserver.common.dto.UserDTO;
import com.talkforum.talkforumserver.common.dto.UserProfileDTO;
import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.common.util.CookieHelper;
import com.talkforum.talkforumserver.common.util.JWTHelper;
import com.talkforum.talkforumserver.common.vo.UserVO;
import com.talkforum.talkforumserver.constant.ServerConstant;
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

    @PostMapping("/")
    public Result registerUser(@RequestBody UserDTO user) {
        return Result.success(userService.registerUser(user));
    }

    @GetMapping("/{userId}")
    public Result getUser(@PathVariable long userId) {
        UserVO user = userService.getUser(userId);
        if (user == null) {
            return Result.error();
        }
        return Result.success(userService.getUser(userId));
    }

    @LoginRequired
    @PutMapping("/")
    public Result setUserProfile(@RequestBody UserProfileDTO user, @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token);
        user.id = (long)(information.get("id"));
        return userService.setUserProfile(user);
    }

    @LoginRequired
    @PutMapping("/changePassword")
    public Result changePassword(String oldPassword, String newPassword, @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token);
        long userId = (long)(information.get("id"));
        return userService.changePassword(userId, oldPassword, newPassword);
    }

    @AdminRequired
    @PutMapping("/{userId}/role")
    public Result setUserRole(@PathVariable long userId, String role) {
        return userService.setUserRole(userId, role);
    }

    @AdminRequired
    @DeleteMapping("/{userId}")
    public Result deleteUser(@PathVariable long userId) {
        return userService.deleteUser(userId);
    }

    @AdminRequired
    @PutMapping("/{userId}/reset")
    public Result resetUserPassword(@PathVariable long userId) {
        return userService.resetUserPassword(userId);
    }

    @AdminRequired
    @PutMapping("/{userId}/status")
    public Result updateUserStatus(@PathVariable long userId, String status) {
        return userService.updateStatus(userId, status);
    }
}
