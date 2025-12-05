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
    private StringRedisTemplate stringRedisTemplate;

    @Override
    public AuthVO login(LoginDTO loginDTO, HttpServletResponse response) throws BusinessRuntimeException {
        User loginCheck = userMapper.getUserLoginInfoByNameOrEmail(loginDTO.nameOrEmail);
        if (loginCheck == null) {
            throw new BusinessRuntimeException("Wrong username or password!");
        }
        if (!loginCheck.status.equals(UserConstant.STATUS_NORMAL)) {
            throw new BusinessRuntimeException("Your account has been locked!Please contact the administrator!");
        }
        if (PasswordHelper.verifyPassword(loginDTO.password, loginCheck.password)) {
            Map<String, Object> information = new HashMap<>();
            information.put("id", loginCheck.id);
            information.put("role", loginCheck.role);
            userMapper.updateLoginTime(loginCheck.id);
            String jwtToken = (jwtHelper.generateJWTToken(information));
            CookieHelper.setCookie(response, ServerConstant.LOGIN_COOKIE, jwtToken);
            loginCheck.lastLoginAt = new Date();
            stringRedisTemplate.opsForValue().set(RedisKeyConstant.TOKEN_USER + loginCheck.id, jwtToken, jwtHelper.getExpire(), TimeUnit.MILLISECONDS);
            // 生成认证信息
            return new AuthVO(new UserVO(loginCheck),
                    interactionMapper.queryInteractFollowingByUserId(loginCheck.id));
        }  else {
            throw new BusinessRuntimeException("Wrong username or password!");
        }
    }

    @Override
    public void logout(long userId, HttpServletResponse response) {
        stringRedisTemplate.delete(RedisKeyConstant.TOKEN_USER+userId);
        CookieHelper.removeCookie(response, ServerConstant.LOGIN_COOKIE);
    }


    @Override
    public AuthVO auth(long userId, HttpServletResponse response)
    {
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
