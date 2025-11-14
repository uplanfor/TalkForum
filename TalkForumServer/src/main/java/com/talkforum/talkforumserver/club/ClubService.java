package com.talkforum.talkforumserver.club;

import com.talkforum.talkforumserver.common.dto.ClubProfileDTO;
import com.talkforum.talkforumserver.common.vo.ClubShortInfoVO;

import java.util.List;

public interface ClubService {
    List<ClubShortInfoVO> getClubList(int page, int count);

    ClubProfileDTO getClubById(long clubId);

    void updateClub(long clubId, ClubProfileDTO clubProfileDTO);

    void deleteClub(long clubId);

    void inviteMember(long clubId, long userId);

    void removeMember(long clubId, long userId);
}
