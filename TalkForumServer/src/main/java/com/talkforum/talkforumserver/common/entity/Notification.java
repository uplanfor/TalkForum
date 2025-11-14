package com.talkforum.talkforumserver.common.entity;

import lombok.Data;

import java.util.Date;

@Data
public class Notification {
    public Long id;
    public Long userId;
    public String type;
    public String relatedId;
    public String operatorId;
    public String content;
    public Character isRead;
    public Character isDeleted;
    public Date createAt;
}
