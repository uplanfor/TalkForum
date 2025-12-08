package com.talkforum.talkforumserver.common.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PostCommitDTO {
    public Long userId;
    public Long id; // 回填id
    public Long clubId;
    public String title;
    @Size(min = 1, max = 16, message = "Tag cannot be too long!")
    public String tag1;
    @Size(min = 1, max = 16, message = "Tag cannot be too long!")
    public String tag2;
    @Size(min = 1, max = 16, message = "Tag cannot be too long!")
    public String tag3;
    @NotBlank
    public String content;

    public void setTag1(String tag1) {
        this.tag1 = tag1 == null ? tag1 : tag1.trim();
    }

    public void setTag2(String tag2) {
        this.tag2 = tag2 == null ? tag2 : tag2.trim();
    }

    public void setTag3(String tag3) {
        this.tag3 = tag3 == null ? tag3 : tag3.trim();
    }
}
