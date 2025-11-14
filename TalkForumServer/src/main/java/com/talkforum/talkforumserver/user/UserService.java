package com.talkforum.talkforumserver.user;

import com.talkforum.talkforumserver.common.dto.UserDTO;
import com.talkforum.talkforumserver.common.dto.UserProfileDTO;
import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.common.vo.UserVO;

public interface UserService {
    public UserVO registerUser(UserDTO user) throws RuntimeException;
    public UserVO getUser(long userId);
    public Result setUserProfile(UserProfileDTO user);
    public Result changePassword(long userId, String oldPassword, String newPassword);

    public Result updateStatus(long userId, String status);
    public Result resetUserPassword(long userId);
    public Result deleteUser(long userId);
    public Result setUserRole(long userId, String role);
    
}
