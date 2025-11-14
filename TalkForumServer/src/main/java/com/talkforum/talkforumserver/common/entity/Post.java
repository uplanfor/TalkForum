package com.talkforum.talkforumserver.common.entity;

import lombok.Data;

import java.util.Date;

@Data
public class Post {
    public Long id;
    public String title;
    public String content;
    public Long userId;
    public Long clubId;
    public String status;
    public Character isEssence;
    public Date createAt;
    public Date updateAt;
    public Integer viewCount;
    public Integer likeCount;
    public Integer commentCount;
}
