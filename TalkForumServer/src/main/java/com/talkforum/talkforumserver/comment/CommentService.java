package com.talkforum.talkforumserver.comment;

import com.talkforum.talkforumserver.common.entity.Comment;
import com.talkforum.talkforumserver.common.vo.CommentListVO;
import org.springframework.beans.factory.annotation.Autowired;

public interface CommentService {
    public CommentListVO getComments(Long postId, int cursor, int pageSize,  Long parentId);
    public Comment getComment(Long commentId);
    public Comment addComment(Long postId, String content, Long parentId, Long userId, String role);
    public void auditComment(Long commentId, String status);
    public void deleteComment(Long commentId, Long userId, String role);
}
