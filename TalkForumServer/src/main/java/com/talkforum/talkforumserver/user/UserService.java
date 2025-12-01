package com.talkforum.talkforumserver.user;

import com.talkforum.talkforumserver.common.dto.UserDTO;
import com.talkforum.talkforumserver.common.dto.UserProfileDTO;
import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.common.vo.PageVO;
import com.talkforum.talkforumserver.common.vo.SimpleUserVO;
import com.talkforum.talkforumserver.common.vo.UserVO;

import java.util.List;

/**
 * 用户服务接口
 * 定义了用户相关的业务逻辑方法
 */
public interface UserService {
    /**
     * 用户注册
     * @param user 用户注册信息DTO
     * @return 用户VO对象
     * @throws RuntimeException 注册失败时抛出异常
     */
    public UserVO registerUser(UserDTO user) throws RuntimeException;
    
    /**
     * 根据用户ID获取用户信息
     * @param userId 用户ID
     * @return 用户VO对象
     */
    public UserVO getUserById(Long userId);
    
    /**
     * 根据邮箱获取用户信息
     * @param email 用户邮箱
     * @return 用户VO对象
     */
    public UserVO getUserByEmail(String email);
    
    /**
     * 批量获取用户简单信息
     * @param userIds 用户ID数组
     * @return 简单用户VO列表
     */
    public List<SimpleUserVO> getSimpleUsersInfo(long[] userIds);
    
    /**
     * 更新用户资料
     * @param user 用户资料DTO
     */
    public void setUserProfile(UserProfileDTO user);
    
    /**
     * 修改用户密码
     * @param userId 用户ID
     * @param oldPassword 旧密码
     * @param newPassword 新密码
     */
    public void changePassword(long userId, String oldPassword, String newPassword);

    /**
     * 删除用户
     * @param userId 用户ID
     */
    public void deleteUser(long userId);

    /**
     * 分页获取用户列表
     * @param page 页码
     * @param pageSize 每页大小
     * @return 分页用户VO列表
     */
    public PageVO<UserVO> getUsersByPage(int page, int pageSize);
    
    /**
     * 设置用户角色
     * @param userId 用户ID
     * @param role 角色
     */
    public void setUserRole(long userId, String role);
    
    /**
     * 重置用户密码
     * @param userId 用户ID
     */
    public void resetUserPassword(long userId);
    
    /**
     * 更新用户状态
     * @param userId 用户ID
     * @param status 状态
     */
    public void updateStatus(long userId, String status);
}
