package com.talkforum.talkforumserver.user;

import com.talkforum.talkforumserver.common.dto.UserDTO;
import com.talkforum.talkforumserver.common.dto.UserProfileDTO;
import com.talkforum.talkforumserver.common.vo.SimpleUserVO;
import com.talkforum.talkforumserver.common.vo.UserVO;
import org.apache.ibatis.annotations.Mapper;
import com.talkforum.talkforumserver.common.entity.User;

import java.util.List;


@Mapper
public interface UserMapper {
    int addUser(UserDTO user);
    UserVO getUserVOById(long userId);
    UserVO getUserVOByEmail(String email);
    User getUserLoginInfoByNameOrEmail(String nameOrEmail);
    User getUserLoginInfoById(long userId);
    List<SimpleUserVO> getSimpleUsersInfo(long[] userIds);
    void setUserProfile(UserProfileDTO userProfile);
    int countUserByNameOrEmail(String name, String email);

    void updateUserStatus(long userId, String status);
    void resetUserPassword(long userId, String hashPassword);
    void deleteUser(long userId);
    void setUserRole(long userId, String role);
    void updateLoginTime(long userId);
    List<UserVO> getUsersByPage(int offset, int limit);

    long countAllUsers();
}
