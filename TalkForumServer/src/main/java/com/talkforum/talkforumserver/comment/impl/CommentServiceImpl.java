package com.talkforum.talkforumserver.comment.impl;

import com.talkforum.talkforumserver.comment.CommentMapper;
import com.talkforum.talkforumserver.comment.CommentService;
import com.talkforum.talkforumserver.common.entity.Comment;
import com.talkforum.talkforumserver.common.exception.BusinessRuntimeException;
import com.talkforum.talkforumserver.common.vo.CommentListVO;
import com.talkforum.talkforumserver.constant.CommentConstant;
import com.talkforum.talkforumserver.constant.UserConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(rollbackFor = Exception.class)
public class CommentServiceImpl implements CommentService {
    @Autowired
    CommentMapper commentMapper;

    @Override
    public CommentListVO getComments(Long postId, int cursor, int pageSize,  Long parentId) {
        List<Comment> comments = commentMapper.getComments(postId, cursor, pageSize, parentId);
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
    public Comment addComment(Long postId, String content, Long parentId, Long userId, String role) {
        int count = commentMapper.countExistComment(postId, parentId);
        if (count == 0) {
            return null;
        }
        Comment comment = new Comment(postId, userId, parentId, content,
                role.equals(UserConstant.ROLE_USER) ? CommentConstant.PENDING : CommentConstant.PASS);
        commentMapper.addComment(comment);
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
