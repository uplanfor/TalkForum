package com.talkforum.talkforumserver.common.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserProfileDTO {
    public Long id;              // 临时变量

    @Size(min = 1, max = 16, message = "The length of your name must be between 1 and 16!")
    public String name;
    @Size(max = 64, message = "Your introduction is too long!")
    public String intro;
    public String avatarLink;
    public String backgroundLink;
}
