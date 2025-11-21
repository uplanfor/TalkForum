package com.talkforum.talkforumserver.common.dto;

import com.sun.istack.NotNull;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserDTO {
    public Long id;
    @NotNull
    @Size(min = 1, max = 16, message = "The length of your name must be between 1 and 16!")
    public String name;
    @NotNull
    @Email
    public String email;
    @NotNull
    public String password;
    public String role;
    public String inviteCode;
}
