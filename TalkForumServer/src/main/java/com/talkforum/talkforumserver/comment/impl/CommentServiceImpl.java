package com.talkforum.talkforumserver.comment.impl;

import com.talkforum.talkforumserver.comment.CommentMapper;
import com.talkforum.talkforumserver.comment.CommentService;
import com.talkforum.talkforumserver.common.dto.AdminAuditCommentsDTO;
import com.talkforum.talkforumserver.common.dto.AdminGetCommentsDTO;
import com.talkforum.talkforumserver.common.entity.Comment;
import com.talkforum.talkforumserver.common.exception.BusinessRuntimeException;
import com.talkforum.talkforumserver.common.vo.CommentListVO;
import com.talkforum.talkforumserver.common.vo.CommentVO;
import com.talkforum.talkforumserver.common.vo.PageVO;
import com.talkforum.talkforumserver.constant.CommentConstant;
import com.talkforum.talkforumserver.constant.InteractionConstant;
import com.talkforum.talkforumserver.constant.UserConstant;
import com.talkforum.talkforumserver.interaction.InteractionMapper;
import com.talkforum.talkforumserver.post.PostMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 评论服务实现类
 * 实现了CommentService接口，处理评论相关的业务逻辑
 */
@Service
@Transactional(rollbackFor = Exception.class)
public class CommentServiceImpl implements CommentService {
    /**
     * 评论数据访问层接口
     */
    @Autowired
    CommentMapper commentMapper;
    
    /**
     * 帖子数据访问层接口
     */
    @Autowired
    PostMapper postMapper;
    
    /**
     * 互动数据访问层接口
     */
    @Autowired
    InteractionMapper interactionMapper;

    /**
     * 获取帖子的评论列表
     * @param postId 帖子ID
     * @param cursor 游标，用于分页查询
     * @param pageSize 每页大小
     * @param userId 用户ID，可为null
     * @return 评论列表VO，包含评论列表、是否有更多和游标信息
     */
    @Override
    public CommentListVO getComments(Long postId, Integer cursor, int pageSize, Long userId) {
        // 查询评论列表
        List<Comment> comments = commentMapper.getComments(postId, cursor, pageSize);
        // 转换为CommentVO并添加互动信息
        List<CommentVO> commentVOs = convertToCommentVOList(comments, userId);
        return new CommentListVO(
                commentVOs, comments.size() == pageSize,
                comments.isEmpty() ? null : comments.get(comments.size() - 1).getId());
    }

    /**
     * 获取评论的回复列表
     * @param postId 帖子ID
     * @param cursor 游标，用于分页查询
     * @param pageSize 每页大小
     * @param rootId 根评论ID
     * @param parentId 父评论ID
     * @param userId 用户ID，可为null
     * @return 评论回复列表VO，包含回复列表、是否有更多和游标信息
     */
    @Override
    public CommentListVO getCommentReplyList(Long postId, Integer cursor, int pageSize, Long rootId, Long parentId, Long userId) {
        // 查询评论回复列表
        List<Comment> comments = commentMapper.getCommentReplies(postId, cursor, pageSize, rootId, parentId);
        // 转换为CommentVO并添加互动信息
        List<CommentVO> commentVOs = convertToCommentVOList(comments, userId);
        return new CommentListVO(
                commentVOs, comments.size() == pageSize,
                comments.isEmpty() ? null : comments.get(comments.size() - 1).getId());
    }

    /**
     * 根据评论ID获取评论
     * @param commentId 评论ID
     * @return 评论实体对象
     * @throws BusinessRuntimeException 当评论不存在时抛出
     */
    @Override
    public Comment getComment(Long commentId) {
        Comment ret = commentMapper.getComment(commentId);
        if (ret == null) {
            throw new BusinessRuntimeException("Comment not found!");
        }
        return ret;
    }

    /**
     * 添加评论并增加帖子评论数
     * @param postId 帖子ID
     * @param content 评论内容
     * @param rootId 根评论ID
     * @param parentId 父评论ID
     * @param userId 评论用户ID
     * @param role 用户角色
     * @return 添加的评论实体对象
     * @throws BusinessRuntimeException 当帖子不存在或回复的评论无效时抛出
     */
    @Override
    public Comment addCommentWithPostCommentCountIncreased(Long postId, String content, Long rootId, Long parentId, Long userId, String role) {
        // 检查帖子是否存在
        long count = postMapper.countPassPost(postId);
        if (count == 0) {
            throw new BusinessRuntimeException("The post did not exist!");
        }
        
        // 创建评论对象，根据用户角色设置审核状态
        Comment comment = new Comment(postId, userId, rootId, parentId, content,
                role.equals(UserConstant.ROLE_USER) ? CommentConstant.PENDING : CommentConstant.PASS);
        
        // 如果是回复评论，检查回复的评论是否存在
        if (rootId != null || parentId != null) {
            int count2 = commentMapper.countExistComment(postId, rootId, parentId);
            if (count2 == 0) {
                throw new BusinessRuntimeException("You cannot reply to the invalid comment!");
            }
        }
        
        // 添加评论并增加帖子评论数
        commentMapper.addCommentWithPostCommentCountIncreased(comment);
        return comment;
    }

    /**
     * 删除评论
     * @param commentId 评论ID
     * @param userId 用户ID
     * @param role 用户角色
     * @throws BusinessRuntimeException 当评论不存在或无权限删除时抛出
     */
    @Override
    public void deleteComment(Long commentId, Long userId, String role) {
        // 检查评论是否存在
        Comment commentCheck = commentMapper.checkDeleteComment(commentId);
        if (commentCheck == null) {
            throw new BusinessRuntimeException("Comment not found!");
        }
        
        // 如果是评论作者或管理员/版主，可以删除评论
        if (commentCheck.getUserId().equals(userId)) {
            commentMapper.auditComment(commentId, CommentConstant.DELETED);
        } else {
            if (!UserConstant.ROLE_USER.equals(role)) {
                commentMapper.auditComment(commentId, CommentConstant.DELETED);
            }
            else {
                throw new BusinessRuntimeException("You cannot delete other's comments!");
            }
        }
    }

    /**
     * 管理员分页获取评论列表
     * @param adminGetCommentsDTO 管理员获取评论DTO，包含分页、筛选等参数
     * @return 分页评论列表VO
     */
    @Override
    public PageVO<Comment> adminGetCommentsByPage(AdminGetCommentsDTO adminGetCommentsDTO) {
        // 查询评论列表
        List<Comment> comments = commentMapper.adminGetCommentsByPage(adminGetCommentsDTO);
        // 构造并返回分页VO对象
        return new PageVO<>(comments, commentMapper.adminCountComments(adminGetCommentsDTO));
    }

    /**
     * 审核评论
     * @param commentId 评论ID
     * @param status 审核状态
     */
    @Override
    public void auditComment(Long commentId, String status) {
        commentMapper.auditComment(commentId, status);
    }
    
    /**
     * 将Comment转换为CommentVO
     * @param comment Comment对象
     * @return CommentVO对象
     */
    private CommentVO convertToCommentVO(Comment comment) {
        CommentVO commentVO = new CommentVO();
        commentVO.setId(comment.getId());
        commentVO.setPostId(comment.getPostId());
        commentVO.setUserId(comment.getUserId());
        commentVO.setRootId(comment.getRootId());
        commentVO.setParentId(comment.getParentId());
        commentVO.setContent(comment.getContent());
        commentVO.setStatus(comment.getStatus());
        commentVO.setCreatedAt(comment.getCreatedAt());
        commentVO.setLikeCount(comment.getLikeCount());
        commentVO.setCommentCount(comment.getCommentCount());
        return commentVO;
    }
    
    /**
     * 将Comment列表转换为CommentVO列表，并添加互动信息
     * @param comments Comment列表
     * @param userId 用户ID，可为null
     * @return CommentVO列表
     */
    private List<CommentVO> convertToCommentVOList(List<Comment> comments, Long userId) {
        List<CommentVO> commentVOs = new ArrayList<>();
        if (comments.isEmpty()) {
            return commentVOs;
        }
        
        // 获取所有评论ID
        Long[] commentIds = comments.stream().map(Comment::getId).toArray(Long[]::new);
        
        // 查询互动信息
        List<Integer> interactContents = null;
        Map<Long, Integer> interactContentMap = new HashMap<>();
        if (userId != null) {
            interactContents = interactionMapper.queryInteractContentByPostOrComment(InteractionConstant.INTERACTION_TYPE_COMMENT, commentIds, userId);
            
            // 创建评论ID到互动内容的映射
            if (interactContents != null) {
                for (int i = 0; i < commentIds.length && i < interactContents.size(); i++) {
                    interactContentMap.put(commentIds[i], interactContents.get(i));
                }
            }
        }
        
        // 转换并添加互动信息
        for (Comment comment : comments) {
            CommentVO commentVO = convertToCommentVO(comment);
            // 设置互动内容，如果没有互动信息则为0
            if (userId != null) {
                commentVO.setInteractContent(interactContentMap.getOrDefault(comment.getId(), 0));
            } else {
                commentVO.setInteractContent(0);
            }
            commentVOs.add(commentVO);
        }
        
        return commentVOs;
    }


    /**
     * 批量审核评论
     */
    public int adminAuditComments(AdminAuditCommentsDTO adminAuditCommentsDTO) {
        if (adminAuditCommentsDTO == null) {
            return 0;
        }
        List<Long> list = adminAuditCommentsDTO.getCommentIds();
        if (list == null || list.isEmpty()) {
            return 0;
        }
        return commentMapper.auditComments(adminAuditCommentsDTO);
    }

}
