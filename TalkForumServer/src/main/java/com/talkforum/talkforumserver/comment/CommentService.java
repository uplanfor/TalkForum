package com.talkforum.talkforumserver.comment;

import com.talkforum.talkforumserver.common.dto.AdminGetCommentsDTO;
import com.talkforum.talkforumserver.common.entity.Comment;
import com.talkforum.talkforumserver.common.vo.CommentListVO;
import com.talkforum.talkforumserver.common.vo.PageVO;
import java.util.List;

/**
 * 评论服务接口
 * 定义了评论相关的业务逻辑方法
 */
public interface CommentService {
    /**
     * 获取帖子的评论列表
     * @param postId 帖子ID
     * @param cursor 游标，用于分页查询
     * @param pageSize 每页大小
     * @return 评论列表VO，包含评论列表、是否有更多和游标信息
     */
    public CommentListVO getComments(Long postId, Integer cursor, int pageSize);
    
    /**
     * 获取评论的回复列表
     * @param postId 帖子ID
     * @param cursor 游标，用于分页查询
     * @param pageSize 每页大小
     * @param rootId 根评论ID
     * @param parentId 父评论ID
     * @return 评论回复列表VO，包含回复列表、是否有更多和游标信息
     */
    public CommentListVO getCommentReplyList(Long postId, Integer cursor, int pageSize, Long rootId, Long parentId);
    
    /**
     * 根据评论ID获取评论
     * @param commentId 评论ID
     * @return 评论实体对象
     */
    public Comment getComment(Long commentId);
    
    /**
     * 添加评论并增加帖子评论数
     * @param postId 帖子ID
     * @param content 评论内容
     * @param rootId 根评论ID
     * @param parentId 父评论ID
     * @param userId 评论用户ID
     * @param role 用户角色
     * @return 添加的评论实体对象
     */
    public Comment addCommentWithPostCommentCountIncreased(Long postId, String content, Long rootId, Long parentId, Long userId, String role);
    
    /**
     * 删除评论
     * @param commentId 评论ID
     * @param userId 用户ID
     * @param role 用户角色
     */
    public void deleteComment(Long commentId, Long userId, String role);

    /**
     * 管理员分页获取评论列表
     * @param adminGetCommentsDTO 管理员获取评论DTO，包含分页、筛选等参数
     * @return 分页评论列表VO
     */
    public PageVO<Comment> adminGetCommentsByPage(AdminGetCommentsDTO adminGetCommentsDTO);
    
    /**
     * 审核评论
     * @param commentId 评论ID
     * @param status 审核状态
     */
    public void auditComment(Long commentId, String status);
}
