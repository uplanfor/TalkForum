package com.talkforum.talkforumserver.common.dto;

import com.sun.istack.NotNull;
import lombok.Data;

@Data
public class UserDTO {
    public Long id;
    @NotNull
    public String name;
    @NotNull
    public String email;
    @NotNull
    public String password;
}
