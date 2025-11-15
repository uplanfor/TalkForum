package com.talkforum.talkforumserver.auth;

import com.talkforum.talkforumserver.common.dto.LoginDTO;
import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.common.vo.UserVO;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthService {
    UserVO login(LoginDTO loginDTO, HttpServletResponse response) throws RuntimeException;
    void logout(String token, HttpServletResponse response);
    UserVO auth(long userId, HttpServletResponse response);
}
