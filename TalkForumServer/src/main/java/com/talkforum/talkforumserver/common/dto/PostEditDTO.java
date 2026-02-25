package com.talkforum.talkforumserver.common.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Schema(
        description = "修改帖子时的参数"
)
@Data
public class PostEditDTO {
    @Schema(
            description = "发起修改动作的用户id"
    )
    public Long userId;

    @Schema(
            description = "被修改帖子id",
            requiredMode =  Schema.RequiredMode.REQUIRED
    )
    @NotNull(message = "Post id cannot be null!")
    public Long id;

    @Schema(
            description = "修改后的帖子所属圈子id(废弃)"
    )
    public Long clubId;

    @Schema(
            description = "修改后的帖子"
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
            description = "帖子内容",
            requiredMode = Schema.RequiredMode.REQUIRED,
            example = "很棒的帖子内容"
    )
    @NotNull
    @Size(min = 1, max = 25000,
            message = "The characters of the post must be between 1 and 25000!")
    public String content;

}
