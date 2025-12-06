package com.talkforum.talkforumserver.common.dto;

import com.sun.istack.NotNull;
import lombok.Data;

@Data
public class InviteCodeDTO {
    @NotNull
    private Integer count;  // 生成数量
    
    @NotNull
    private Integer expiredDays;  // 过期时间
    
    @NotNull
    private Integer maxCount;  // 最大使用次数
}
