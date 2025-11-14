package com.talkforum.talkforumserver.club.impl;

import com.talkforum.talkforumserver.club.ClubMapper;
import com.talkforum.talkforumserver.club.ClubMemberMapper;
import com.talkforum.talkforumserver.club.ClubService;
import com.talkforum.talkforumserver.common.dto.ClubProfileDTO;
import com.talkforum.talkforumserver.common.vo.ClubShortInfoVO;
import com.talkforum.talkforumserver.common.vo.UserVO;
import com.talkforum.talkforumserver.user.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClubServiceImpl implements ClubService {
    @Autowired
    private ClubMapper clubMapper;
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private ClubMemberMapper clubMemberMapper;

    @Override
    public List<ClubShortInfoVO> getClubList(int page, int count) {
        int offset = (page - 1) * count;
        return clubMapper.getClubList(offset, count);
    }

    @Override
    public ClubProfileDTO getClubById(long clubId) {
        return clubMapper.getClubById(clubId);
    }

    @Override
    public void updateClub(long clubId, ClubProfileDTO clubProfileDTO) {
        if (clubMapper.updateClub(clubId, clubProfileDTO) == 0) {
            throw new RuntimeException("The club is not exist");
        }
    }

    @Override
    public void deleteClub(long clubId) {
        if (clubMapper.deleteClub(clubId) == 0) {
            throw new RuntimeException("The club is not exist");
        }
    }


    @Override
    public void inviteMember(long clubId, long userId) {
        UserVO userCheck = userMapper.getUserVOById(userId);
        ClubProfileDTO clubProfileDTO = clubMapper.getClubById(clubId);
        if (userCheck == null || clubProfileDTO == null) {
            throw new RuntimeException("The user or club is not exist");
        }
        clubMemberMapper.addClubMember(clubId, userId);
    }

    @Override
    public void removeMember(long clubId, long userId) {
        if (clubMemberMapper.deleteClubMember(clubId, userId) == 0) {
            throw new RuntimeException("The user is not exist in the club");
        }
    }
}
