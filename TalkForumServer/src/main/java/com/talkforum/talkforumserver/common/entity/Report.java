package com.talkforum.talkforumserver.common.entity;

import lombok.Data;

import java.util.Date;

@Data
public class Report {
    public Long id;
    public Long userId;
    public String reportType;
    public String reportTargetType;
    public Long reportTarget;
    public String reason;
    public String status;
    public Date createdAt;
    public Date handledAt;
    public Long handledBy;
}
