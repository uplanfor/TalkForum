package com.talkforum.talkforumserver.common.vo;

import lombok.Data;

import java.util.Date;

@Data
public class PostVO {
    public Long id;
    public String title;
    public Long userId;
    public Long clubId;
    public String content;
    public String brief;
    public String status;
    public Character isEssence;
    public Date createdAt;
    public Date updatedAt;
    public Integer viewCount;
    public Integer likeCount;
    public Integer commentCount;

    public Integer interactContent;
}
