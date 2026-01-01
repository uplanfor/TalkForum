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
            description = "帖子所属标签",
            maxLength = 16,
            example = "能源电力"
    )
    @Size(max = 16, message = "Tag cannot be too long!")
    public String tag1;

    @Schema(
            description = "帖子所属标签",
            maxLength = 16,
            example = "工程师"
    )
    @Size( max = 16, message = "Tag cannot be too long!")
    public String tag2;

    @Schema(
            description = "帖子所属标签",
            maxLength = 16,
            example = "pi"
    )
    @Size(max = 16, message = "Tag cannot be too long!")
    public String tag3;

    @Schema(
            description = "发帖内容",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotBlank
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
