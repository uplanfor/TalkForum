package com.talkforum.talkforumserver.common.vo;

import com.talkforum.talkforumserver.common.entity.User;
import lombok.Data;

import java.util.Date;

@Data
public class SimpleUserVO {
    public Long id;
    public String name;
    public String avatarLink;
}
