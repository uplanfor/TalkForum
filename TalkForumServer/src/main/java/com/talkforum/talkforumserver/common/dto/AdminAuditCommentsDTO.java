package com.talkforum.talkforumserver.common.dto;

import com.sun.istack.NotNull;
import java.util.List;
import lombok.Data;

@Data
public class AdminAuditCommentsDTO {
    @NotNull
    private String status;
    @NotNull
    private List<Long> commentIds;
}
