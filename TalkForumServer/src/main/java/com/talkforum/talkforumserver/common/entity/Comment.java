package com.talkforum.talkforumserver.common.entity;

import com.talkforum.talkforumserver.constant.CommentConstant;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    public Integer commentCount;

    public Comment() {
        id = null;
        postId = null;
        userId = null;
        parentId = null;
        content = "";
        status = CommentConstant.PENDING;
        createAt = new Date();
        likeCount = 0;
        commentCount = 0;
    }

    public Comment(Long postId, Long userId, Long parentId, String content, String status) {
        super();
        this.postId = postId;
        this.userId = userId;
        this.parentId = parentId;
        this.content = content;
        this.status = status;
    }
}
