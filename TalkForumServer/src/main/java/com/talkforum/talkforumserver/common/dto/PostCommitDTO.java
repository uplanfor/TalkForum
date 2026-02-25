package com.talkforum.talkforumserver.common.dto;


import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Schema(
        description = "发帖时的请求参数"
)
@Data
public class PostCommitDTO {
    @Schema(
            description = "发帖人用户id",
            example = "16354"
    )
    public Long userId;


    @Schema(
            requiredMode = Schema.RequiredMode.NOT_REQUIRED
    )
    public Long id; // 回填id

    @Schema(
            description = "帖子所属的圈子id(废弃)",
            example = "12"
    )
    public Long clubId;

    @Schema(
            description = "帖子标题"
    )
    public String title;


    @Schema(
            description = "帖子所属标签，支持多个标签，每个标签以英文分号结尾，每个标签文本长度小于等于16,最多8个标签",
            maxLength = 256,
            example = "创作者计划;这就是螺蛳粉"
    )
    @Size(max = 256, message = "Too much tags!")
    public String tags;

    @Schema(
            description = "发帖内容",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotBlank(message = "The content of the post cannot be blank!")
    public String content;
}
