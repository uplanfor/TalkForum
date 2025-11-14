package com.talkforum.talkforumserver.club;

import com.talkforum.talkforumserver.common.dto.ClubProfileDTO;
import com.talkforum.talkforumserver.common.vo.ClubShortInfoVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ClubMapper {
    List<ClubShortInfoVO> getClubList(int offset, int count);
    ClubProfileDTO getClubById(long clubId);
    int updateClub(long clubId, ClubProfileDTO clubProfileDTO);
    int deleteClub(long clubId);
}
