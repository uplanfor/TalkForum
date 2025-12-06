package com.talkforum.talkforumserver.common.dto;

import com.sun.istack.NotNull;
import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
public class UpdateInviteCodeDTO {
    @NotNull
    private List<String> codes;
    
    private Integer maxCount;
    
    private Integer expiredDays;

    // 被修改
    private Date expiredAt;
}