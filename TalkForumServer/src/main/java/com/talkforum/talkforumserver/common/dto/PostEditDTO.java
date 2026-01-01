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
            description = "帖子所属标签",
            maxLength = 16,
            example = "能源电力"
    )
    @Size(max = 16, message = "Tag cannot be too long!")
    public String tag1;

    @Schema(
            description = "帖子所属标签",
            maxLength = 16,
            example = "能源电力"
    )
    @Size(max = 16, message = "Tag cannot be too long!")
    public String tag2;

    @Schema(
            description = "帖子所属标签",
            maxLength = 16,
            example = "能源电力"
    )
    @Size(max = 16, message = "Tag cannot be too long!")
    public String tag3;

    @Schema(
            description = "帖子内容",
            requiredMode = Schema.RequiredMode.REQUIRED,
            example = "很棒的帖子内容"
    )
    @NotNull
    @Size(min = 1, max = 25000,
            message = "The characters of the post must be between 1 and 25000!")
    public String content;


    public void setTag1(String tag1) {
        this.tag1 = tag1 == null ? tag1 : tag1.trim();
    }

    public void setTag2(String tag2) {
        this.tag2 = tag2 == null ? tag2 : tag2.trim();
    }

    public void setTag3(String tag3) {
        this.tag3 = tag3 == null ? tag3 : tag3.trim();
    }
}
