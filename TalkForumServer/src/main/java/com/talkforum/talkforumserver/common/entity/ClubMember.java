package com.talkforum.talkforumserver.common.entity;

import lombok.Data;

import java.util.Date;

@Data
public class ClubMember {
    public Long id;
    public Long clubId;
    public Long userId;
    public String role;
    public Date joinedAt;
}
