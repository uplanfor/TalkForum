package com.talkforum.talkforumserver.comment;

import com.talkforum.talkforumserver.common.anno.LoginRequired;
import com.talkforum.talkforumserver.common.dto.AddCommentDTO;
import com.talkforum.talkforumserver.common.entity.Comment;
import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.common.util.JWTHelper;
import com.talkforum.talkforumserver.constant.ServerConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/comments")
public class CommentController {
    @Autowired
    CommentService commentService;
    @Autowired
    JWTHelper jwtHelper;

    @GetMapping("/")
    public Result getCommentList(long postId, int page, int pageSize, Long parentId) {
        return Result.success("Successfully get comment list!", commentService.getComments(postId, page, pageSize, parentId));
    }

    @LoginRequired
    @PostMapping("/")
    public Result addComment(@RequestBody AddCommentDTO addCommentDTO, @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token);
        long userId = ((Number)(information.get("id"))).longValue();
        String role = (String)(information.get("role"));

        Comment comment = commentService.addComment(
                addCommentDTO.getPostId(),
                addCommentDTO.getContent(),
                addCommentDTO.getParentId(),
                userId, role);
        if (comment != null) {
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
}
