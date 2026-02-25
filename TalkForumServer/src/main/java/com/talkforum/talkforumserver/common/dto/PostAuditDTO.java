package com.talkforum.talkforumserver.common.dto;

import com.talkforum.talkforumserver.constant.PostConstant;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class PostAuditDTO {
    @Schema(
            description = "审核结果",
            example = PostConstant.PASS,
            allowableValues = {PostConstant.PASS, PostConstant.PENDING, PostConstant.DELETED, PostConstant.REJECTED}
    )
    private String status;
}
