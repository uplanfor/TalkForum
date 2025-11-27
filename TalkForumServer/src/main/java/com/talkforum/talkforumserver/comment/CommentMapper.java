package com.talkforum.talkforumserver.comment;

import com.talkforum.talkforumserver.common.entity.Comment;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CommentMapper {
    public List<Comment> getComments(Long postId, int cursor, int pageSize,  Long parentId);
    public Comment getComment(Long commentId);
    public Comment checkDeleteComment(Long commentId);
    public int countExistComment(Long postId, Long parentId);
    public void addComment(Comment comment);
    public void auditComment(Long commentId, String status);
}
