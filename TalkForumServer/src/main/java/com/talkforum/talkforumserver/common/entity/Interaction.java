package com.talkforum.talkforumserver.common.entity;

import java.util.Date;

public class Interaction {
    public Long id;
    public Long userId;
    public Integer interactContent;
    public String interactTargetType;
    public Integer interactTarget;
    public Date interactDate;
}
