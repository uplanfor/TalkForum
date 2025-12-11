package com.talkforum.talkforumserver.auth.impl;

import com.talkforum.talkforumserver.auth.AuthService;
import com.talkforum.talkforumserver.auth.AuthMapper;
import com.talkforum.talkforumserver.common.anno.LoginRequired;
import com.talkforum.talkforumserver.common.dto.LoginDTO;
import com.talkforum.talkforumserver.common.entity.User;
import com.talkforum.talkforumserver.common.exception.BusinessRuntimeException;
import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.common.util.CookieHelper;
import com.talkforum.talkforumserver.common.util.JWTHelper;
import com.talkforum.talkforumserver.common.util.PasswordHelper;
import com.talkforum.talkforumserver.common.util.RedisHelper;
import com.talkforum.talkforumserver.common.vo.AuthVO;
import com.talkforum.talkforumserver.common.vo.UserVO;
import com.talkforum.talkforumserver.constant.RedisKeyConstant;
import com.talkforum.talkforumserver.constant.ServerConstant;
import com.talkforum.talkforumserver.constant.UserConstant;
import com.talkforum.talkforumserver.interaction.InteractionMapper;
import com.talkforum.talkforumserver.user.UserMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@Transactional(rollbackFor = Exception.class)
public class AuthServiceImpl implements AuthService {
//    @Autowired
//    private AuthMapper authMapper;
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private JWTHelper jwtHelper;
    @Autowired
    private InteractionMapper interactionMapper;
    @Autowired
    private RedisHelper redisHelper;

    @Override
    public AuthVO login(LoginDTO loginDTO, HttpServletResponse response) throws BusinessRuntimeException {
        User loginCheck = userMapper.getUserLoginInfoByNameOrEmail(loginDTO.nameOrEmail);
        // 判断用户是否存在
        if (loginCheck == null) {
            throw new BusinessRuntimeException("Wrong username or password!");
        }
        // 判断账号是否被封
        if (!loginCheck.status.equals(UserConstant.STATUS_NORMAL)) {
            throw new BusinessRuntimeException("Your account has been locked!Please contact the administrator!");
        }
        // 判断密码是否正确
        if (PasswordHelper.verifyPassword(loginDTO.password, loginCheck.password)) {
            // 生成JWT
            Map<String, Object> information = new HashMap<>();
            information.put("id", loginCheck.id);
            information.put("role", loginCheck.role);
            userMapper.updateLoginTime(loginCheck.id);
            String jwtToken = (jwtHelper.generateJWTToken(information));
            loginCheck.lastLoginAt = new Date();

            // 存入Redis和HttpOnlyCookie
            CookieHelper.setCookie(response, ServerConstant.LOGIN_COOKIE, jwtToken);
            redisHelper.setLoginToken(loginCheck.id, jwtToken, (long)jwtHelper.getExpire(), TimeUnit.MILLISECONDS);
            // 生成认证信息
            return new AuthVO(new UserVO(loginCheck),
                    interactionMapper.queryInteractFollowingByUserId(loginCheck.id));
        }  else {
            throw new BusinessRuntimeException("Wrong username or password!");
        }
    }

    @Override
    public void logout(long userId, HttpServletResponse response) {
        // 移除Cookie
        redisHelper.removeLoginToken(userId);
        CookieHelper.removeCookie(response, ServerConstant.LOGIN_COOKIE);
    }


    @Override
    public AuthVO auth(long userId, HttpServletResponse response)
    {
        // 尝试判断用户是否登录
        try {
            List<Long> arr= interactionMapper.queryInteractFollowingByUserId(userId);
            return new AuthVO(userMapper.getUserVOById(userId),
                    interactionMapper.queryInteractFollowingByUserId(userId));
        } catch (Exception e) {
            logout(userId, response);
            throw new BusinessRuntimeException("Timeout, please sign in again!");
        }
    }
}
