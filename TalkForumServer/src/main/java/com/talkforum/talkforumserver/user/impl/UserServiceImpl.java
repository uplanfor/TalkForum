package com.talkforum.talkforumserver.user.impl;

import com.talkforum.talkforumserver.common.dto.LoginDTO;
import com.talkforum.talkforumserver.common.dto.UserDTO;
import com.talkforum.talkforumserver.common.dto.UserProfileDTO;
import com.talkforum.talkforumserver.common.entity.User;
import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.common.util.PasswordHelper;
import com.talkforum.talkforumserver.common.vo.UserVO;
import com.talkforum.talkforumserver.constant.ServerConstant;
import com.talkforum.talkforumserver.constant.UserConstant;
import com.talkforum.talkforumserver.invitecode.InviteCodeMapper;
import com.talkforum.talkforumserver.invitecode.InviteCodeService;
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
    @Autowired
    private InviteCodeMapper inviteCodeMapper;

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
        if (userMapper.countUserByNameOrEmail(user.name, user.email) > 0) {
            throw new RuntimeException("The user already exists. Please choose other name or email!");
        }
        user.password = PasswordHelper.encryptPassword(user.password);
        // 自动注册管理员身份
        if (user.name.equals("MASTER")) {
            user.role = UserConstant.ROLE_ADMIN;
        } else {
            if (user.inviteCode == null) {
                throw new RuntimeException("Only with invite code can you register!");
            }

            if (inviteCodeMapper.checkInviteCodeValid(user.inviteCode) == 0) {
                throw new RuntimeException(
                        "The invite code cannot be used because it does not exist, has expired, or has reached its maximum usage limit");
            }
            user.role = UserConstant.ROLE_USER;
        }


        try {
            userMapper.addUser(user);
            if(user.inviteCode != null) {
                inviteCodeMapper.updateUsedCount(user.inviteCode);
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to add user!Maybe your invite code is invalid!");
        }
        return getUserById(user.id);
    }

    @Override
    public UserVO getUserById(Long userId) {
        return userMapper.getUserVOById(userId);
    }

    @Override
    public UserVO getUserByEmail(String email) {
        return userMapper.getUserVOByEmail(email);
    }

    @Override
    public void setUserProfile(UserProfileDTO user) {
        userMapper.setUserProfile(user);
    }

    @Override
    public void updateStatus(long userId, String status) {
        userMapper.updateUserStatus(userId, status);
    }

    @Override
    public void resetUserPassword(long userId) {
        userMapper.resetUserPassword(userId,
                PasswordHelper.encryptPassword(PasswordHelper.encryptPassword(ServerConstant.DEFAULT_PASSWORD)));
    }

    @Override
    public void deleteUser(long userId) {
        userMapper.deleteUser(userId);
    }

    @Override
    public void setUserRole(long userId, String role) {
        userMapper.setUserRole(userId, role);
    }

    @Override
    public void changePassword(long userId, String oldPassword, String newPassword) throws RuntimeException {
        System.out.println(oldPassword);
        System.out.println(newPassword);
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
        } else {
            throw new RuntimeException("Your login password is wrong!");
        }

    }
}
