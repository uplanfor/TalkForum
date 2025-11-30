package com.talkforum.talkforumserver.common.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PostEditDTO {
    public Long userId;
    @NotNull(message = "Post id cannot be null!")
    public Long id;
    public Long clubId;
    public String title;
    @NotNull
    @Size(min = 1, max = 25000,
            message = "The characters of the post must be between 1 and 25000!")
    public String content;
}
