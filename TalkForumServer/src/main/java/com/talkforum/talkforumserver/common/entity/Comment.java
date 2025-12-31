package com.talkforum.talkforumserver.common.entity;

import com.talkforum.talkforumserver.constant.CommentConstant;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * 评论实体类
 * 对应数据库中的评论表，存储论坛帖子的评论信息
 * 支持多级评论回复结构，包含评论内容、状态、统计信息等
 */
@Data
@Schema(
    name = "Comment",
    description = "评论实体类，存储论坛帖子的评论信息，支持多级评论回复结构"
)
public class Comment {
    
    /**
     * 评论唯一标识符
     * 数据库主键，自动生成的评论ID
     */
    @Schema(
        description = "评论唯一标识符，数据库主键",
        example = "1234567890",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    public Long id;
    
    /**
     * 所属帖子ID
     * 外键关联帖子表，表示评论所属的帖子
     */
    @Schema(
        description = "评论所属的帖子ID，外键关联帖子表",
        example = "9876543210",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    public Long postId;
    
    /**
     * 评论用户ID
     * 外键关联用户表，表示发表评论的用户
     */
    @Schema(
        description = "发表评论的用户ID，外键关联用户表",
        example = "1111111111",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    public Long userId;
    
    /**
     * 根评论ID
     * 用于多级评论结构，表示最顶层的评论ID
     * 如果是直接评论帖子，此字段为null
     */
    @Schema(
        description = "根评论ID，用于多级评论结构，如果是直接评论帖子则为null",
        example = "2222222222",
        nullable = true
    )
    public Long rootId;
    
    /**
     * 父评论ID
     * 用于回复评论，表示直接父评论的ID
     * 如果是直接评论帖子或回复根评论，此字段为null
     */
    @Schema(
        description = "父评论ID，表示直接回复的评论，如果是直接评论帖子则为null",
        example = "3333333333",
        nullable = true
    )
    public Long parentId;
    
    /**
     * 评论内容
     * 用户输入的评论文本内容
     */
    @Schema(
        description = "评论文本内容",
        example = "这是一条很有价值的评论内容",
        requiredMode = Schema.RequiredMode.REQUIRED,
        minLength = 1,
        maxLength = 1000
    )
    public String content;
    
    /**
     * 评论状态
     * 评论的当前状态，控制评论的可见性
     */
    @Schema(
        description = "评论状态，控制评论的可见性",
        example = "APPROVED",
        requiredMode = Schema.RequiredMode.REQUIRED,
        allowableValues = {"PENDING", "APPROVED", "REJECTED", "DELETED"}
    )
    public String status;
    
    /**
     * 创建时间
     * 评论发表的时间戳
     */
    @Schema(
        description = "评论发表的时间戳",
        example = "2023-12-31T23:59:59.000Z",
        requiredMode = Schema.RequiredMode.REQUIRED,
        format = "date-time"
    )
    public Date createdAt;
    
    /**
     * 点赞数
     * 评论获得的点赞数量统计
     */
    @Schema(
        description = "评论获得的点赞数量统计",
        example = "128",
        requiredMode = Schema.RequiredMode.REQUIRED,
        minimum = "0"
    )
    public Integer likeCount;
    
    /**
     * 回复数
     * 评论的回复数量统计，用于显示评论热度
     */
    @Schema(
        description = "评论的回复数量统计，用于显示评论热度",
        example = "56",
        requiredMode = Schema.RequiredMode.REQUIRED,
        minimum = "0"
    )
    public Integer commentCount;

    /**
     * 默认构造函数
     * 初始化评论的默认值
     */
    public Comment() {
        id = null;
        postId = null;
        userId = null;
        parentId = null;
        content = "";
        status = CommentConstant.PENDING; // 默认为待审核状态
        createdAt = new Date(); // 当前时间
        likeCount = 0; // 初始点赞数为0
        commentCount = 0; // 初始回复数为0
    }

    /**
     * 带参数的构造函数
     * @param postId 所属帖子ID
     * @param userId 评论用户ID
     * @param rootId 根评论ID
     * @param parentId 父评论ID
     * @param content 评论内容
     * @param status 评论状态
     */
    public Comment(Long postId, Long userId, Long rootId, Long parentId, String content, String status) {
        this(); // 调用默认构造函数初始化默认值
        this.postId = postId;
        this.userId = userId;
        this.rootId = rootId;
        this.parentId = parentId;
        this.content = content;
        this.status = status;
    }
}