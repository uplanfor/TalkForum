package com.talkforum.talkforumserver.auth.impl;

import com.talkforum.talkforumserver.auth.AuthService;
import com.talkforum.talkforumserver.auth.AuthMapper;
import com.talkforum.talkforumserver.common.anno.LoginRequired;
import com.talkforum.talkforumserver.common.dto.LoginDTO;
import com.talkforum.talkforumserver.common.entity.User;
import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.common.util.CookieHelper;
import com.talkforum.talkforumserver.common.util.JWTHelper;
import com.talkforum.talkforumserver.common.util.PasswordHelper;
import com.talkforum.talkforumserver.common.vo.UserVO;
import com.talkforum.talkforumserver.constant.ServerConstant;
import com.talkforum.talkforumserver.constant.UserConstant;
import com.talkforum.talkforumserver.user.UserMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@Transactional(rollbackFor = Exception.class)
public class AuthServiceImpl implements AuthService {
    @Autowired
    private AuthMapper authMapper;
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private JWTHelper jwtHelper;

    @Override
    public Result login(LoginDTO loginDTO, HttpServletResponse response) throws RuntimeException {
        User loginCheck = userMapper.getUserLoginInfoByNameOrEmail(loginDTO.nameOrEmail);
        if (loginCheck == null) {
            throw new RuntimeException("Wrong username or password!");
        }
        if (!loginCheck.status.equals(UserConstant.STATUS_NORMAL)) {
            throw new RuntimeException("Your account has been locked!Please contact the administrator!");
        }
        if (PasswordHelper.verifyPassword(loginDTO.password, loginCheck.password)) {
            Map<String, Object> information = new HashMap<>();
            information.put("id", loginCheck.id);
            information.put("role", loginCheck.role);
            CookieHelper.setCookie(response, ServerConstant.LOGIN_COOKIE, (jwtHelper.generateJWTToken(information)));
            return Result.success();
        }  else {
            throw new RuntimeException("Wrong username or password!");
        }
    }

    @LoginRequired
    @Override
    public void logout(String token, HttpServletResponse response) {
        CookieHelper.removeCookie(response, ServerConstant.LOGIN_COOKIE);
    }
}
