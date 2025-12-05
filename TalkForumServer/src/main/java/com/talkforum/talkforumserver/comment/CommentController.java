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

/**
 * 评论控制器
 * 处理评论相关的HTTP请求，包括获取评论列表、添加评论、删除评论等
 */
@RestController
@RequestMapping("/comments")
public class CommentController {
    @Autowired
    private CommentService commentService; // 评论服务层
    @Autowired
    private JWTHelper jwtHelper; // JWT工具类，用于解析和生成Token
    @Autowired
    private UserMapper userMapper; // 用户Mapper
    @Autowired
    private CommentMapper commentMapper; // 评论Mapper

    /**
     * 获取评论列表
     * @param postId 帖子ID
     * @param cursor 游标，用于分页
     * @param pageSize 每页大小
     * @param token 登录凭证Token
     * @return 评论列表
     */
    @GetMapping("/")
    @Validated
    public Result getCommentList(
            @NotNull long postId, Integer cursor, @NotNull int pageSize,
            @CookieValue(name = ServerConstant.LOGIN_COOKIE, required = false) String token) {
        Long userId = null;
        if (token != null) {
            Map<String, Object> information = jwtHelper.parseJWTToken(token);
            userId = ((Number) information.get("id")).longValue();
        }
        return Result.success("Successfully get comment list!",
                commentService.getComments(postId, cursor, pageSize, userId));
    }

    /**
     * 获取评论回复列表
     * @param postId 帖子ID
     * @param cursor 游标，用于分页
     * @param pageSize 每页大小
     * @param rootId 根评论ID
     * @param parentId 父评论ID
     * @param token 登录凭证Token
     * @return 评论回复列表
     */
    @GetMapping("/replies")
    @Validated
    public Result getCommentReplyList(
            @NotNull long postId, Integer cursor,
            @NotNull int pageSize, @NotNull Long rootId,
            Long parentId, @CookieValue(name = ServerConstant.LOGIN_COOKIE, required = false) String token) {
        Long userId = null;
        if (token != null) {
            Map<String, Object> information = jwtHelper.parseJWTToken(token);
            userId = ((Number) information.get("id")).longValue();
        }
        return Result.success("Successfully get comment replies",
                commentService.getCommentReplyList(postId, cursor, pageSize, rootId, parentId, userId));
    }

    /**
     * 添加评论
     * @param addCommentDTO 评论添加DTO
     * @param token 登录凭证Token
     * @return 添加结果
     */
    @LoginRequired
    @PostMapping("/")
    @Validated
    public Result addComment(@RequestBody AddCommentDTO addCommentDTO, @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token); // 解析Token获取用户信息
        long userId = ((Number)(information.get("id"))).longValue(); // 获取用户ID
        String role = (String)(information.get("role")); // 获取用户角色

        // 添加评论并增加帖子评论数
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

    /**
     * 删除评论
     * @param commentId 评论ID
     * @param token 登录凭证Token
     * @return 删除结果
     */
    @LoginRequired
    @DeleteMapping("/{commentId}")
    public Result deleteComment(@PathVariable long commentId, @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token); // 解析Token获取用户信息
        long userId = ((Number)(information.get("id"))).longValue(); // 获取用户ID
        String role = (String)(information.get("role")); // 获取用户角色
        commentService.deleteComment(commentId, userId, role); // 删除评论
        return Result.success("Successfully delete comment!");
    }

    /**
     * 管理员获取评论列表
     * @param adminGetCommentsDTO 管理员评论列表请求DTO
     * @return 评论列表
     */
    @ModeratorRequired
    @GetMapping("/admin")
    public Result adminGetCommentsByPage(AdminGetCommentsDTO adminGetCommentsDTO) {
        return Result.success("Successfully get comments!", commentService.adminGetCommentsByPage(adminGetCommentsDTO));
    }
}
