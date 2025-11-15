package com.talkforum.talkforumserver.invitecode;

import com.talkforum.talkforumserver.common.entity.InviteCode;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface InviteCodeMapper {
    int insert(InviteCode inviteCode);
    
    InviteCode selectByCode(String code);
    
    List<InviteCode> selectByCreatorId(Long creatorId);

    int checkInviteCodeValid(String code);
    
    int updateUsedCount(String code);
    
    int deleteByCode(String code);
    
    int updateStatus(InviteCode inviteCode);


}
