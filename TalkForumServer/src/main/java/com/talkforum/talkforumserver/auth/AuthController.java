package com.talkforum.talkforumserver.auth;

import com.talkforum.talkforumserver.common.anno.LoginRequired;
import com.talkforum.talkforumserver.common.dto.LoginDTO;
import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.constant.ServerConstant;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public Result login(@RequestBody LoginDTO loginDTO, HttpServletResponse response) {
        return Result.success(authService.login(loginDTO, response));
    }


    @LoginRequired
    @PostMapping("/logout")
    public Result logout(@CookieValue(name = ServerConstant.LOGIN_COOKIE) String token, HttpServletResponse response) {
        authService.logout(token, response);
        return Result.success();
    }
}
