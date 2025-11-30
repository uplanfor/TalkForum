package com.talkforum.talkforumserver.comment;

import com.sun.istack.NotNull;
import com.talkforum.talkforumserver.common.anno.LoginRequired;
import com.talkforum.talkforumserver.common.anno.ModeratorRequired;
import com.talkforum.talkforumserver.common.dto.AddCommentDTO;
import com.talkforum.talkforumserver.common.dto.AdminGetCommentsDTO;
import com.talkforum.talkforumserver.common.entity.Comment;
import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.common.util.JWTHelper;
import com.talkforum.talkforumserver.constant.ServerConstant;
import com.talkforum.talkforumserver.user.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/comments")
public class CommentController {
    @Autowired
    CommentService commentService;
    @Autowired
    JWTHelper jwtHelper;
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private CommentMapper commentMapper;

    @GetMapping("/")
    @Validated
    public Result getCommentList(@NotNull long postId, Integer cursor, @NotNull int pageSize) {
        return Result.success("Successfully get comment list!",
                commentService.getComments(postId, cursor, pageSize));
    }

    @GetMapping("/replies")
    @Validated
    public Result getCommentReplyList(@NotNull long postId, Integer cursor, @NotNull int pageSize, @NotNull Long rootId, Long parentId) {
        return Result.success("Successfully get comment replies",
                commentService.getCommentReplyList(postId, cursor, pageSize, rootId, parentId));
    }

    @LoginRequired
    @PostMapping("/")
    @Validated
    public Result addComment(@RequestBody AddCommentDTO addCommentDTO, @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token);
        long userId = ((Number)(information.get("id"))).longValue();
        String role = (String)(information.get("role"));

        Comment comment = commentService.addCommentWithPostCommentCountIncreased(
                addCommentDTO.getPostId(),
                addCommentDTO.getContent(),
                addCommentDTO.getRootId(),
                addCommentDTO.getParentId(),
                userId, role);
        if (comment.id != null) {
            return Result.success("Successfully add comment!", comment);
        }
        return Result.error("Fail to add comment!");
    }

    @LoginRequired
    @DeleteMapping("/{commentId}")
    public Result deleteComment(@PathVariable long commentId, @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token);
        long userId = ((Number)(information.get("id"))).longValue();
        String role = (String)(information.get("role"));
        commentService.deleteComment(commentId, userId, role);
        return Result.success("Successfully delete comment!");
    }

    @ModeratorRequired
    @GetMapping("/admin/")
    public Result adminGetCommentsByPage(AdminGetCommentsDTO adminGetCommentsDTO) {
        return Result.success("Successfully get comments!", commentService.adminGetCommentsByPage(adminGetCommentsDTO));
    }
}
