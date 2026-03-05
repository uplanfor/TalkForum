package com.talkforum.talkforumserver.mapper;

import com.talkforum.talkforumserver.common.dto.AdminAuditCommentsDTO;
import com.talkforum.talkforumserver.common.dto.AdminGetCommentsDTO;
import com.talkforum.talkforumserver.common.entity.Comment;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CommentMapper {
    List<Comment> getComments(Long postId, Integer cursor, int pageSize);
    List<Comment> getCommentReplies(Long postId, Integer cursor, int pageSize, Long rootId, Long parentId);
    Comment getComment(Long commentId);
    Comment checkDeleteComment(Long commentId);
    int countExistComment(Long postId, Long rootId, Long parentId);
    void addCommentWithPostCommentCountIncreased(Comment comment);

    List<Comment> adminGetCommentsByPage(AdminGetCommentsDTO adminGetCommentsDTO);
    long adminCountComments(AdminGetCommentsDTO adminGetCommentsDTO);
    void auditComment(Long commentId, String status);

    int auditComments(AdminAuditCommentsDTO adminAuditCommentsDTO);

    List<Comment> adminGetCommentsContent(List<Long> commentIds);
}
