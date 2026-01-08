package com.talkforum.talkforumserver.service;

import com.talkforum.talkforumserver.common.util.RedisHelper;
import com.talkforum.talkforumserver.constant.RedisConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Component
public interface AuthCacheService {
    // 用于获取登录令牌
    public Object getLoginToken(Long userId);

    // 用于设置登录令牌
    public void setLoginToken(Long userId, String token, Long expireTime, TimeUnit timeUnit);

    // 用于移除登录令牌
    public void removeLoginToken(Long userId);
}
