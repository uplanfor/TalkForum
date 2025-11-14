package com.talkforum.talkforumserver.common.entity;


import lombok.Data;

@Data
public class Club {
    public Long id;
    public String name;
    public String description;
    public String avatarLink;
    public String backgroundLink;
    public String creatorId;
    public String createAt;
    public Integer memberCount;
    public Character isDeleted;
}
