package com.talkforum.talkforumserver.comment;

import com.talkforum.talkforumserver.common.dto.AdminGetCommentsDTO;
import com.talkforum.talkforumserver.common.entity.Comment;
import com.talkforum.talkforumserver.common.vo.PageVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CommentMapper {
    public List<Comment> getComments(Long postId, Integer cursor, int pageSize);
    public List<Comment> getCommentReplies(Long postId, Integer cursor, int pageSize, Long rootId, Long parentId);
    public Comment getComment(Long commentId);
    public Comment checkDeleteComment(Long commentId);
    public int countExistComment(Long postId, Long rootId, Long parentId);
    public void addCommentWithPostCommentCountIncreased(Comment comment);

    List<Comment> adminGetCommentsByPage(AdminGetCommentsDTO adminGetCommentsDTO);
    long adminCountComments(AdminGetCommentsDTO adminGetCommentsDTO);
    public void auditComment(Long commentId, String status);
}
