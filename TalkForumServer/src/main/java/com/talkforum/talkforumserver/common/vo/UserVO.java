package com.talkforum.talkforumserver.common.vo;

import com.talkforum.talkforumserver.common.entity.User;
import lombok.Data;

import java.util.Date;

@Data
public class UserVO {
    public Long id;
    public String email;
    public String name;
    public String role;
    public String intro;
    public Date createdAt;
    public Date lastLoginAt;
    public String status;
    public String avatarLink;
    public String backgroundLink;


    public UserVO() {}

    public UserVO(User user) {
        this.id = user.id;
        this.email = user.email;
        this.name = user.name;
        this.role = user.role;
        this.intro = user.intro;
        this.createdAt = user.createdAt;
        this.lastLoginAt = user.lastLoginAt;
        this.status = user.status;
        this.avatarLink = user.avatarLink;
        this.backgroundLink = user.backgroundLink;
    }
}
