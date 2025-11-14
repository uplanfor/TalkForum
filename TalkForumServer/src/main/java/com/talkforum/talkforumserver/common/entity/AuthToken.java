package com.talkforum.talkforumserver.common.entity;

import lombok.Data;

import java.util.Date;

@Data
public class AuthToken {
    public int id;
    public int userId;
    public String token;
    public Date expireTime;
    public Date createAt;
    public char isValid;
}
