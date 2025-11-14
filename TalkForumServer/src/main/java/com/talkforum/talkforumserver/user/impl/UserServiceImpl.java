package com.talkforum.talkforumserver.user.impl;

import com.talkforum.talkforumserver.common.dto.LoginDTO;
import com.talkforum.talkforumserver.common.dto.UserDTO;
import com.talkforum.talkforumserver.common.dto.UserProfileDTO;
import com.talkforum.talkforumserver.common.entity.User;
import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.common.util.PasswordHelper;
import com.talkforum.talkforumserver.common.vo.UserVO;
import com.talkforum.talkforumserver.constant.ServerConstant;
import com.talkforum.talkforumserver.user.UserMapper;
import com.talkforum.talkforumserver.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@Transactional(rollbackFor = Exception.class)
public class UserServiceImpl implements UserService {
    @Autowired
    private UserMapper userMapper;

    @Override
    public UserVO registerUser(UserDTO user) throws RuntimeException {
        // 判断密码长度是否在8,32之间，且是字母数字和.和_的任意排列组合，邮箱格式是否正确
        if (user.password.length() < 8 || user.password.length() > 32 ||
                !user.password.matches(ServerConstant.USER_PASSWORD_RULE)) {
            throw new RuntimeException(ServerConstant.PASSWORD_RULE_WARNING);
        }
        // 验证邮箱
        if (!user.email.matches("^\\w+@\\w+\\.\\w+$")) {
            throw new RuntimeException("Invalid email format");
        }
        user.password = PasswordHelper.encryptPassword(user.password);
        UserVO userVO = getUser(user.id);
        if (userVO != null) {
            throw new RuntimeException("User already exists");
        }
        userMapper.addUser(user);
        return getUser(user.id);
    }

    @Override
    public UserVO getUser(long userId) {
        return userMapper.getUserVOById(userId);
    }

    @Override
    public Result setUserProfile(UserProfileDTO user) {
        userMapper.setUserProfile(user);
        return Result.success();
    }

    @Override
    public Result updateStatus(long userId, String status) {
        userMapper.updateUserStatus(userId, status);
        return Result.success();
    }

    @Override
    public Result resetUserPassword(long userId) {
        userMapper.resetUserPassword(userId,
                PasswordHelper.encryptPassword(PasswordHelper.encryptPassword(ServerConstant.DEFAULT_PASSWORD)));
        return Result.success();
    }

    @Override
    public Result deleteUser(long userId) {
        userMapper.deleteUser(userId);
        return Result.success();
    }

    @Override
    public Result setUserRole(long userId, String role) {
        userMapper.setUserRole(userId, role);
        return Result.success();
    }

    @Override
    public Result changePassword(long userId, String oldPassword, String newPassword) throws RuntimeException {
        // 验证新密码格式
        if (newPassword.length() < 8 || newPassword.length() > 32 ||
                !newPassword.matches(ServerConstant.USER_PASSWORD_RULE)) {
            throw new RuntimeException(ServerConstant.PASSWORD_RULE_WARNING);
        }

        // 获取用户信息
        User loginCheck = userMapper.getUserLoginInfoById(userId);
        if (PasswordHelper.verifyPassword(oldPassword, loginCheck.password)) {
            // 加密新密码并更新
            String encryptedPassword = PasswordHelper.encryptPassword(newPassword);
            userMapper.resetUserPassword(userId, encryptedPassword);
            return Result.success();
        } else {
            throw new RuntimeException("Wrong password!");
        }

    }
}
