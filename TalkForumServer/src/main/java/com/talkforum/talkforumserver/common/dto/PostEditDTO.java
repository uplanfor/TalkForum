package com.talkforum.talkforumserver.common.dto;

import com.sun.istack.NotNull;
import lombok.Data;

@Data
public class PostEditDTO {
    public Long userId;
    @NotNull
    public Long id;
    public Long clubId;
    public String title;
    @NotNull
    public String content;
}
