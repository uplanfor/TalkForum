package com.talkforum.talkforumserver.common.vo;

import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
public class AuthVO {
    public Long id;
    public String email;
    public String name;
    public String role;
    public int fansCount;
    public int followingCount;
    public String intro;
    public Date createdAt;
    public Date lastLoginAt;
    public String status;
    public String avatarLink;
    public String backgroundLink;
    public List<Long> following;

    public AuthVO(UserVO userVO, List<Long> following) {
        this.id = userVO.getId();
        this.email = userVO.getEmail();
        this.name = userVO.getName();
        this.role = userVO.getRole();
        this.fansCount = userVO.getFansCount();
        this.followingCount = userVO.getFollowingCount();
        this.intro = userVO.getIntro();
        this.createdAt = userVO.getCreatedAt();
        this.lastLoginAt = userVO.getLastLoginAt();
        this.status = userVO.getStatus();
        this.avatarLink = userVO.getAvatarLink();
        this.backgroundLink = userVO.getBackgroundLink();
        this.following = following;
    }
}
