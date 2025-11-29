package com.talkforum.talkforumserver.comment;

import com.talkforum.talkforumserver.common.entity.Comment;
import com.talkforum.talkforumserver.common.vo.CommentListVO;

public interface CommentService {
    public CommentListVO getComments(Long postId, Integer cursor, int pageSize);
    public CommentListVO getCommentReplyList(Long postId, Integer cursor, int pageSize, Long rootId, Long parentId);
    public Comment getComment(Long commentId);
    public Comment addCommentWithPostCommentCountIncreased(Long postId, String content, Long rootId, Long parentId, Long userId, String role);
    public void auditComment(Long commentId, String status);
    public void deleteComment(Long commentId, Long userId, String role);

}
