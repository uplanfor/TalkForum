package com.talkforum.talkforumserver.service;

import com.talkforum.talkforumserver.common.dto.LoginDTO;
import com.talkforum.talkforumserver.common.vo.AdminHomeVO;
import com.talkforum.talkforumserver.common.vo.AuthVO;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthService {
    AuthVO login(LoginDTO loginDTO, HttpServletResponse response) throws RuntimeException;
    void logout(long userID, HttpServletResponse response);
    void logout(long userId);
    AuthVO auth(long userId, HttpServletResponse response);

    AdminHomeVO getAdminHomeInfo(long userId, HttpServletResponse response);
}
