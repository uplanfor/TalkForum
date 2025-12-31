package com.talkforum.talkforumserver.mapper;

import com.talkforum.talkforumserver.common.vo.AdminHomeVO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface AuthMapper {
//    AuthVO createToken(LoginDTO loginDTO);
//    void removeToken(String token);
    AdminHomeVO getAdminHomeInfo();
}
