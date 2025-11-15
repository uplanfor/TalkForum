package com.talkforum.talkforumserver.user;

import com.talkforum.talkforumserver.common.dto.UserDTO;
import com.talkforum.talkforumserver.common.dto.UserProfileDTO;
import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.common.vo.UserVO;

public interface UserService {
    public UserVO registerUser(UserDTO user) throws RuntimeException;
    public UserVO getUserById(Long userId);
    public UserVO getUserByEmail(String email);
    public void setUserProfile(UserProfileDTO user);
    public void changePassword(long userId, String oldPassword, String newPassword);

    public void updateStatus(long userId, String status);
    public void resetUserPassword(long userId);
    public void deleteUser(long userId);
    public void setUserRole(long userId, String role);
    
}
