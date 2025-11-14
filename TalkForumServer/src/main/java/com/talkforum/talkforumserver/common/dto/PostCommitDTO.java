package com.talkforum.talkforumserver.common.dto;

import com.sun.istack.NotNull;
import lombok.Data;

@Data
public class PostCommitDTO {
    public Long userId;
    public Long id; // 回填id
    public Long clubId;
    public String title;
    @NotNull
    public String content;
}
