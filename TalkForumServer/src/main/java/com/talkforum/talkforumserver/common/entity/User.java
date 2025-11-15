package com.talkforum.talkforumserver.common.entity;

import lombok.Data;

import java.util.Date;

@Data
public class User {
    public Long id;
    public String email;
    public String password;
    public String name;
    public String role;
    public String intro;
    public Date createdAt;
    public Date lastLoginAt;
    public String status;
    public String avatarLink;
    public String backgroundLink;
    public String usedInviteCode;
}
