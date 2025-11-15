package com.talkforum.talkforumserver.auth;

import com.talkforum.talkforumserver.common.anno.LoginRequired;
import com.talkforum.talkforumserver.common.dto.LoginDTO;
import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.common.util.JWTHelper;
import com.talkforum.talkforumserver.constant.ServerConstant;
import com.talkforum.talkforumserver.user.UserMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private AuthService authService;
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private JWTHelper jwtHelper;

    @PostMapping("/login")
    public Result login(@RequestBody LoginDTO loginDTO, HttpServletResponse response) {
        return Result.success("Sign in successfully", authService.login(loginDTO, response));
    }


    @LoginRequired
    @PostMapping("/logout")
    public Result logout(@CookieValue(name = ServerConstant.LOGIN_COOKIE) String token, HttpServletResponse response) {
        authService.logout(token, response);
        return Result.success("Sign out successfully!");
    }

    @GetMapping("/")
    public Result auth(@CookieValue(name = ServerConstant.LOGIN_COOKIE) String token, HttpServletResponse response) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token);
        long userId = ((Number)(information.get("id"))).longValue();
        return Result.success("Success to update information!", authService.auth(userId, response));
    }
}
