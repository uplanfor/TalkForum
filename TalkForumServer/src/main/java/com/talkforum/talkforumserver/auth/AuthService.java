package com.talkforum.talkforumserver.auth;

import com.talkforum.talkforumserver.common.dto.LoginDTO;
import com.talkforum.talkforumserver.common.result.Result;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthService {
    Result login(LoginDTO loginDTO, HttpServletResponse response) throws RuntimeException;
    void logout(String token, HttpServletResponse response);
}
