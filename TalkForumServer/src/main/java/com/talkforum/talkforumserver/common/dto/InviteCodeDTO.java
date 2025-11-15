package com.talkforum.talkforumserver.common.dto;

import com.sun.istack.NotNull;
import lombok.Data;

import java.util.Date;

@Data
public class InviteCodeDTO {
    @NotNull
    public Integer maxCount;
    @NotNull
    public Integer generateCount;
    @NotNull
    public Integer expireDays;
}
