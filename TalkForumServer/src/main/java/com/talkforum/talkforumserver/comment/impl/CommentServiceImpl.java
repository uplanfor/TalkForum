package com.talkforum.talkforumserver.comment.impl;

import com.talkforum.talkforumserver.comment.CommentMapper;
import com.talkforum.talkforumserver.comment.CommentService;
import com.talkforum.talkforumserver.common.entity.Comment;
import com.talkforum.talkforumserver.common.exception.BusinessRuntimeException;
import com.talkforum.talkforumserver.common.vo.CommentListVO;
import com.talkforum.talkforumserver.constant.CommentConstant;
import com.talkforum.talkforumserver.constant.UserConstant;
import com.talkforum.talkforumserver.post.PostMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(rollbackFor = Exception.class)
public class CommentServiceImpl implements CommentService {
    @Autowired
    CommentMapper commentMapper;
    @Autowired
    PostMapper postMapper;

    @Override
    public CommentListVO getComments(Long postId, Integer cursor, int pageSize) {
        List<Comment> comments = commentMapper.getComments(postId, cursor, pageSize);
        return new CommentListVO(
                comments, comments.size() == pageSize,
                comments.isEmpty() ? null : comments.get(comments.size() - 1).getId());
    }

    @Override
    public CommentListVO getCommentReplyList(Long postId, Integer cursor, int pageSize, Long rootId, Long parentId) {
        List<Comment> comments = commentMapper.getCommentReplies(postId, cursor, pageSize, rootId, parentId);
        return new CommentListVO(
                comments, comments.size() == pageSize,
                comments.isEmpty() ? null : comments.get(comments.size() - 1).getId());
    }

    @Override
    public Comment getComment(Long commentId) {
        Comment ret = commentMapper.getComment(commentId);
        if (ret == null) {
            throw new BusinessRuntimeException("Comment not found!");
        }
        return ret;
    }


    @Override
    public void auditComment(Long commentId, String status) {
        commentMapper.auditComment(commentId, status);
    }

    @Override
    public Comment addCommentWithPostCommentCountIncreased(Long postId, String content, Long rootId, Long parentId, Long userId, String role) {
        int count = postMapper.countPassPost(postId);
        if (count == 0) {
            throw new BusinessRuntimeException("The post did not exist!");
        }
        Comment comment = new Comment(postId, userId, rootId, parentId, content,
                role.equals(UserConstant.ROLE_USER) ? CommentConstant.PENDING : CommentConstant.PASS);
        if (rootId != null || parentId != null) {
            int count2 = commentMapper.countExistComment(postId, rootId, parentId);
            if (count2 == 0) {
                throw new BusinessRuntimeException("You cannot reply to the invalid comment!");
            }
        }
        commentMapper.addCommentWithPostCommentCountIncreased(comment);
        return comment;
    }

    @Override
    public void deleteComment(Long commentId, Long userId, String role) {
        Comment commentCheck = commentMapper.checkDeleteComment(commentId);
        if (commentCheck == null) {
            throw new BusinessRuntimeException("Comment not found!");
        }
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
}
