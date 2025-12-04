package com.talkforum.talkforumserver.common.vo;

import com.talkforum.talkforumserver.constant.CommentConstant;
import lombok.Data;

import java.util.Date;

@Data
public class CommentVO {
    /**
     * 评论ID，主键
     */
    public Long id;
    /**
     * 所属帖子ID，外键关联Post表
     */
    public Long postId;
    /**
     * 评论用户ID，外键关联User表
     */
    public Long userId;
    /**
     * 根评论ID，用于多级评论
     */
    public Long rootId;
    /**
     * 父评论ID，用于回复评论
     */
    public Long parentId;
    /**
     * 评论内容
     */
    public String content;
    /**
     * 评论状态，如待审核、已发布、已删除等
     */
    public String status;
    /**
     * 创建时间
     */
    public Date createdAt;
    /**
     * 点赞数
     */
    public Integer likeCount;
    /**
     * 回复数
     */
    public Integer commentCount;
    /**
     * 互动情况
     */
    public Integer interactContent;

    /**
     * 默认构造函数
     * 初始化评论的默认值
     */
    public CommentVO() {
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
    public CommentVO(Long postId, Long userId, Long rootId, Long parentId, String content, String status) {
        this(); // 调用默认构造函数初始化默认值
        this.postId = postId;
        this.userId = userId;
        this.rootId = rootId;
        this.parentId = parentId;
        this.content = content;
        this.status = status;
    }
}
