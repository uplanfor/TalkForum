package com.talkforum.talkforumserver.club;

import com.talkforum.talkforumserver.common.dto.ClubProfileDTO;
import com.talkforum.talkforumserver.common.vo.ClubShortInfoVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ClubMemberMapper {
    public int addClubMember(long clubId, long userId);
    public int deleteClubMember(long clubId, long userId);
}
