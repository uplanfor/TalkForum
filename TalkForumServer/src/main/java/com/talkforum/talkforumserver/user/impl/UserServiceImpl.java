package com.talkforum.talkforumserver.user.impl;

import com.talkforum.talkforumserver.common.dto.UserDTO;
import com.talkforum.talkforumserver.common.dto.UserProfileDTO;
import com.talkforum.talkforumserver.common.entity.User;
import com.talkforum.talkforumserver.common.exception.BusinessRuntimeException;
import com.talkforum.talkforumserver.common.util.I18n;
import com.talkforum.talkforumserver.common.util.PasswordHelper;
import com.talkforum.talkforumserver.common.vo.PageVO;
import com.talkforum.talkforumserver.common.vo.SimpleUserVO;
import com.talkforum.talkforumserver.common.vo.UserVO;
import com.talkforum.talkforumserver.constant.ServerConstant;
import com.talkforum.talkforumserver.constant.UserConstant;
import com.talkforum.talkforumserver.invitecode.InviteCodeMapper;
import com.talkforum.talkforumserver.user.UserMapper;
import com.talkforum.talkforumserver.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 用户服务实现类
 * 实现了UserService接口中定义的所有用户相关业务逻辑
 */
@Service
@Transactional(rollbackFor = Exception.class)
public class UserServiceImpl implements UserService {
    @Autowired
    private UserMapper userMapper; // 用户数据访问层
    @Autowired
    private InviteCodeMapper inviteCodeMapper; // 邀请码数据访问层

    /**
     * 用户注册实现
     * @param user 用户注册信息DTO
     * @return 用户VO对象
     * @throws BusinessRuntimeException 注册失败时抛出异常
     */
    @Override
    public UserVO registerUser(UserDTO user) throws BusinessRuntimeException {
        // 判断密码长度是否在8-32之间，且符合字母数字和.和_的规则，验证邮箱格式
        if (user.password.length() < 8 || user.password.length() > 32 ||
                !user.password.matches(ServerConstant.USER_PASSWORD_RULE)) {
            throw new BusinessRuntimeException(ServerConstant.PASSWORD_RULE_WARNING);
        }
        // 验证邮箱格式
        if (!user.email.matches("^\\w+@\\w+\\.\\w+$")) {
            throw new BusinessRuntimeException(I18n.t("user.email.invalid"));
        }
        // 检查用户名或邮箱是否已存在
        if (userMapper.countUserByNameOrEmail(user.name, user.email) > 0) {
            throw new BusinessRuntimeException(I18n.t("user.exists"));
        }
        // 加密密码
        user.password = PasswordHelper.encryptPassword(user.password);
        // 自动注册管理员身份（特定邮箱）
        if (user.email.equals("master@talkforum.top")) {
            user.role = UserConstant.ROLE_ADMIN;
        } else {
            // 普通用户需要邀请码
            if (user.inviteCode == null) {
                throw new BusinessRuntimeException(I18n.t("user.invitecode.required"));
            }
            // 验证邀请码是否有效
            if (inviteCodeMapper.checkInviteCodeValid(user.inviteCode) == 0) {
                throw new BusinessRuntimeException(I18n.t("user.invitecode.invalid"));
            }
            user.role = UserConstant.ROLE_USER;
        }

        try {
            // 插入用户数据
            userMapper.addUser(user);
            // 如果使用了邀请码，更新邀请码使用次数
            if(user.inviteCode != null) {
                inviteCodeMapper.updateUsedCount(user.inviteCode);
            }
        } catch (Exception e) {
            throw new BusinessRuntimeException(I18n.t("user.add.failed"));
        }
        // 返回注册成功的用户信息
        return getUserById(user.id);
    }

    /**
     * 根据用户ID获取用户信息实现
     * @param userId 用户ID
     * @return 用户VO对象
     * @throws BusinessRuntimeException 用户不存在时抛出异常
     */
    @Override
    public UserVO getUserById(Long userId) {
        UserVO userVO = userMapper.getUserVOById(userId);
        if (userVO == null) {
            throw new BusinessRuntimeException(I18n.t("user.not.found"));
        }
        return userVO;
    }

    /**
     * 根据邮箱获取用户信息实现
     * @param email 用户邮箱
     * @return 用户VO对象
     * @throws BusinessRuntimeException 用户不存在时抛出异常
     */
    @Override
    public UserVO getUserByEmail(String email) {
        UserVO userVO = userMapper.getUserVOByEmail(email);
        if (userVO == null) {
            throw new BusinessRuntimeException(I18n.t("user.not.found"));
        }
        return userVO;
    }

    /**
     * 批量获取用户简单信息实现
     * @param userIds 用户ID数组
     * @return 简单用户VO列表
     */
    @Override
    public List<SimpleUserVO> getSimpleUsersInfo(long[] userIds) {
        return userMapper.getSimpleUsersInfo(userIds);
    }

    /**
     * 更新用户资料实现
     * @param user 用户资料DTO
     */
    @Override
    public void setUserProfile(UserProfileDTO user) {
        userMapper.setUserProfile(user);
    }

    /**
     * 修改用户密码实现
     * @param userId 用户ID
     * @param oldPassword 旧密码
     * @param newPassword 新密码
     * @throws BusinessRuntimeException 密码修改失败时抛出异常
     */
    @Override
    public void changePassword(long userId, String oldPassword, String newPassword) throws BusinessRuntimeException {
        // 验证新密码格式
        if (newPassword.length() < 8 || newPassword.length() > 32 ||
                !newPassword.matches(ServerConstant.USER_PASSWORD_RULE)) {
            throw new BusinessRuntimeException(ServerConstant.PASSWORD_RULE_WARNING);
        }

        // 获取用户登录信息
        User loginCheck = userMapper.getUserLoginInfoById(userId);
        // 验证旧密码是否正确
        if (PasswordHelper.verifyPassword(oldPassword, loginCheck.password)) {
            // 加密新密码并更新
            String encryptedPassword = PasswordHelper.encryptPassword(newPassword);
            userMapper.resetUserPassword(userId, encryptedPassword);
        } else {
            throw new BusinessRuntimeException(I18n.t("user.password.wrong"));
        }
    }

    /**
     * 删除用户实现
     * @param userId 用户ID
     */
    @Override
    public void deleteUser(long userId) {
        userMapper.deleteUser(userId);
    }

    /**
     * 分页获取用户列表实现
     * @param page 页码
     * @param pageSize 每页大小
     * @return 分页用户VO列表
     */
    @Override
    public PageVO<UserVO> getUsersByPage(int page, int pageSize) {
        // 计算分页偏移量
        int offset = (page - 1) * pageSize;
        // 获取分页用户列表
        List<UserVO> list = userMapper.getUsersByPage(offset, pageSize);
        // 构造并返回分页VO对象
        return new PageVO<>(list, userMapper.countAllUsers());
    }

    /**
     * 设置用户角色实现
     * @param userId 用户ID
     * @param role 角色
     */
    @Override
    public void setUserRole(long userId, String role) {
        userMapper.setUserRole(userId, role);
    }

    /**
     * 更新用户状态实现
     * @param userId 用户ID
     * @param status 状态
     */
    @Override
    public void updateStatus(long userId, String status) {
        userMapper.updateUserStatus(userId, status);
    }

    /**
     * 重置用户密码实现
     * @param userId 用户ID
     */
    @Override
    public void resetUserPassword(long userId) {
        // 重置密码为默认密码
        userMapper.resetUserPassword(userId,
                PasswordHelper.encryptPassword((ServerConstant.DEFAULT_PASSWORD)));
    }
}
