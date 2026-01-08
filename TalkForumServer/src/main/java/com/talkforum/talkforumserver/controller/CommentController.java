package com.talkforum.talkforumserver.controller;

import com.talkforum.talkforumserver.common.vo.CommentListVO;
import com.talkforum.talkforumserver.common.vo.PageVO;
import com.talkforum.talkforumserver.mapper.CommentMapper;
import com.talkforum.talkforumserver.service.CommentService;
import com.talkforum.talkforumserver.common.anno.LoginRequired;
import com.talkforum.talkforumserver.common.anno.ModeratorRequired;
import com.talkforum.talkforumserver.common.dto.AddCommentDTO;
import com.talkforum.talkforumserver.common.dto.AdminAuditCommentsDTO;
import com.talkforum.talkforumserver.common.dto.AdminGetCommentsDTO;
import com.talkforum.talkforumserver.common.entity.Comment;
import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.common.util.I18n;
import com.talkforum.talkforumserver.common.util.JWTHelper;
import com.talkforum.talkforumserver.constant.ServerConstant;
import com.talkforum.talkforumserver.constant.UserConstant;
import com.talkforum.talkforumserver.mapper.UserMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 评论管理控制器
 * 处理评论相关的HTTP请求，包括获取评论列表、添加评论、删除评论、管理员审核等
 * 提供完整的评论管理功能，支持多级评论回复结构
 */
@Tag(
    name = "评论管理",
    description = "评论相关接口，包括获取评论列表、添加评论、删除评论、管理员审核等功能，支持多级评论回复结构"
)
@RestController
@RequestMapping("/comments")
@Validated
public class CommentController {
    @Autowired
    private CommentService commentService; // 评论服务层
    @Autowired
    private JWTHelper jwtHelper; // JWT工具类，用于解析和生成Token

    /**
     * 获取评论列表
     * 根据帖子ID获取该帖子下的评论列表，支持分页查询
     * 可选用户登录状态，用于显示用户与评论的互动状态
     * 
     * @param postId 帖子ID，必须存在且有效
     * @param cursor 游标，用于分页，为null时从第一页开始
     * @param pageSize 每页大小，必须大于0
     * @param token 登录凭证Token，可选参数
     * @return 评论列表的统一响应结果
     */
    @Operation(
        summary = "获取评论列表",
        description = "根据帖子ID获取该帖子下的评论列表，支持分页查询和用户互动状态显示，注意，这个只要执行了获取动作，success都会为true"
    )
    @ApiResponse(
            responseCode = "200", // 响应状态码
            description = "请求成功",
            content = @Content( // 指定响应内容
                    mediaType = "application/json", // 媒体类型（JSON格式）
                    schema = @Schema(
                            implementation = Result.class,
                            subTypes = CommentListVO.class
                    )
            )
    )
    @GetMapping("/")
    public Result<CommentListVO> getCommentList(
            @Parameter(description = "帖子id", example = "1") @NotNull long postId,
            @Parameter(description = "游标(可为空)", example = "236") Integer cursor,
            @Parameter(description = "游标(可为空)", example = "236") @NotNull int pageSize,
            @Parameter(description = "登录token，用于解析登录情况") @CookieValue(name = ServerConstant.LOGIN_COOKIE, required = false) String token) {
        Long userId = null;
        try {
            if (token != null) {
                Map<String, Object> information = jwtHelper.parseJWTToken(token);
                userId = ((Number) information.get("id")).longValue();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return Result.success(I18n.t("comment.list.success"),
                commentService.getComments(postId, cursor, pageSize, userId));
    }

    /**
     * 获取评论回复列表
     * 获取指定评论下的回复列表，支持多级评论结构
     * 可选用户登录状态，用于显示用户与评论的互动状态
     * 
     * @param postId 帖子ID，必须存在且有效
     * @param cursor 游标，用于分页，为null时从第一页开始
     * @param pageSize 每页大小，必须大于0
     * @param rootId 根评论ID，必须存在且有效
     * @param parentId 父评论ID，可选参数
     * @param token 登录凭证Token，可选参数
     * @return 评论回复列表的统一响应结果
     */
    @Operation(
        summary = "获取评论回复列表",
        description = "获取指定评论下的回复列表，支持多级评论结构，可选用户互动状态显示"
    )
    @ApiResponse(
            responseCode = "200",
            description = "请求成功",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Result.class, subTypes =  CommentListVO.class)
            )
    )
    @GetMapping("/replies")
    @Validated
    public Result<CommentListVO> getCommentReplyList(
            @Parameter(description = "帖子的id") @NotNull long postId,
            @Parameter(description = "游标") Integer cursor,
            @Parameter(description = "分页大小（最大10)") @NotNull int pageSize,
            @Parameter(description = "根评论id") @NotNull Long rootId,
            @Parameter(description = "被回复的评论id,可为NULL") Long parentId,
            @Parameter(description = "用户登录token，用于返回点赞情况") @CookieValue(name = ServerConstant.LOGIN_COOKIE, required = false) String token) {
        Long userId = null;
        // 处理登录的状况
        try {
            if (token != null) {
                Map<String, Object> information = jwtHelper.parseJWTToken(token);
                userId = ((Number) information.get("id")).longValue();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return Result.success(I18n.t("comment.reply.list.success"),
                commentService.getCommentReplyList(postId, cursor, pageSize, rootId, parentId, userId));
    }

    /**
     * 添加评论
     * 用户发表评论，需要登录权限
     * 支持直接评论帖子和回复其他评论
     * 
     * @param addCommentDTO 评论添加DTO，包含评论内容和相关关联信息
     * @param token 登录凭证Token
     * @return 添加结果的统一响应结果
     */
    @Operation(
        summary = "添加评论",
        description = "用户发表评论，需要登录权限，支持直接评论帖子和回复其他评论"
    )
    @ApiResponse(
            responseCode = "200",
            description = "请求成功",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(
                            implementation = Result.class,
                            subTypes = Comment.class
                    )
            )
    )
    @LoginRequired
    @PostMapping("/")
    public Result<Comment> addComment(
            @RequestBody @Valid AddCommentDTO addCommentDTO,
            @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token) {
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
            return Result.success(role.equals(UserConstant.ROLE_USER) ?
                    I18n.t("comment.add.user.success") : I18n.t("comment.add.admin.success"), comment);
        }
        return Result.error(I18n.t("comment.add.failed"));
    }

    /**
     * 删除评论
     * 用户删除自己的评论，需要登录权限
     * 管理员可以删除任何评论
     * 
     * @param commentId 评论ID，必须存在且有效
     * @param token 登录凭证Token
     * @return 删除结果的统一响应结果
     */
    @Operation(
        summary = "删除评论",
        description = "用户删除自己的评论，需要登录权限，管理员可以删除任何评论"
    )
    @LoginRequired
    @DeleteMapping("/{commentId}")
    public Result<Object> deleteComment(
            @PathVariable long commentId,
            @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token); // 解析Token获取用户信息
        long userId = ((Number)(information.get("id"))).longValue(); // 获取用户ID
        String role = (String)(information.get("role")); // 获取用户角色
        commentService.deleteComment(commentId, userId, role); // 删除评论
        return Result.success(I18n.t("comment.delete.success"));
    }

    /**
     * 管理员获取评论列表
     * 管理员获取评论列表，支持按状态筛选和分页查询
     * 需要管理员或版主权限
     * 
     * @param adminGetCommentsDTO 管理员评论列表请求DTO
     * @return 评论列表的统一响应结果
     */
    @Operation(
        summary = "管理员获取评论列表",
        description = "管理员获取评论列表，支持按状态筛选和分页查询，需要管理员或版主权限"
    )
    @ApiResponse(
            responseCode = "200",
            description = "请求成功",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(
                            implementation = Result.class,
                            subTypes = PageVO.class
                    )
            )
    )
    @ModeratorRequired
    @GetMapping("/admin")
    public Result<PageVO<Comment>> adminGetCommentsByPage(
            @Valid AdminGetCommentsDTO adminGetCommentsDTO) {
        return Result.success(I18n.t("comment.admin.list.success"),
                commentService.adminGetCommentsByPage(adminGetCommentsDTO));
    }

    /**
     * 管理员审核评论
     * 管理员批量审核评论，支持通过、拒绝等操作
     * 需要管理员或版主权限
     * 
     * @param adminAuditCommentsDTO 管理员审核评论请求DTO
     * @return 审核结果的统一响应结果
     */
    @Operation(
        summary = "管理员审核评论",
        description = "管理员批量审核评论，支持通过、拒绝等操作，需要管理员或版主权限"
    )
    @Validated
    @ModeratorRequired
    @PutMapping("/admin/audit")
    public Result<Object> adminAuditComments(
             @RequestBody @Valid AdminAuditCommentsDTO adminAuditCommentsDTO) {
        return Result.success(I18n.t("comment.admin.audit.success"),
                commentService.adminAuditComments(adminAuditCommentsDTO));
    }

    /**
     * 管理员获取评论内容
     * 管理员批量获取评论的详细内容，用于审核或查看
     * 需要管理员或版主权限
     * 
     * @param commentIds 评论ID列表，必须包含至少一个有效ID
     * @return 评论内容列表的统一响应结果
     */
    @Operation(
        summary = "管理员获取评论内容",
        description = "管理员批量获取评论的详细内容，用于审核或查看，需要管理员或版主权限"
    )
    @ApiResponse(
            responseCode = "200",
            description = "请求成功",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(
                            implementation = Result.class,
                            subTypes = List.class
                    )
            )
    )
    @ModeratorRequired
    @GetMapping("/admin/content")
    public Result<List<Comment>> adminGetCommentsContent(
            @RequestParam List<Long> commentIds) {
        return Result.success(I18n.t("comment.admin.get.success"), commentService.adminGetCommentsContent(commentIds));
    }
}