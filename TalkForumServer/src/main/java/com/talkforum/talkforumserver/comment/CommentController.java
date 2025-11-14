package com.talkforum.talkforumserver.comment;

import com.talkforum.talkforumserver.common.anno.LoginRequired;
import com.talkforum.talkforumserver.common.result.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/comments")
public class CommentController {
    @Autowired
    CommentService commentService;

    @GetMapping("/")
    public Result getCommentList(int postId, int page, int pageSize) {
        return Result.success();
    }

    @LoginRequired
    @PostMapping("/")
    public Result addComment(int postId) {
        return Result.success();
    }
}
