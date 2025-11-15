package com.talkforum.talkforumserver.common.entity;

import lombok.Data;
import java.util.Date;

@Data
public class InviteCode {
    public String code;

    public Long creatorId;

    public Date createdAt;

    public Date expiredAt;

    public int maxCount = 1;

    public int usedCount = 0;
}
