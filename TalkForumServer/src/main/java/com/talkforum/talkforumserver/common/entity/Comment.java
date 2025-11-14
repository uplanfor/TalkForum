package com.talkforum.talkforumserver.common.entity;

import lombok.Data;

import java.util.Date;

@Data
public class Comment {
    public Long id;
    public Long postId;
    public Long userId;
    public Long parentId;
    public String content;
    public String status;
    public Date createAt;
    public Integer likeCount;
}
