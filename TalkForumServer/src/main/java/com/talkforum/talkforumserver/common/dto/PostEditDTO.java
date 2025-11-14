package com.talkforum.talkforumserver.common.dto;

import com.sun.istack.NotNull;
import lombok.Data;

@Data
public class PostEditDTO {
    public Long userId;
    public Long clubId;
    public String title;
    public String content;
}
