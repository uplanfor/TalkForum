package com.talkforum.talkforumserver.post;

import com.talkforum.talkforumserver.common.anno.LoginRequired;
import com.talkforum.talkforumserver.common.anno.ModeratorRequired;
import com.talkforum.talkforumserver.common.dto.*;
import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.common.util.I18n;
import com.talkforum.talkforumserver.common.util.JWTHelper;
import com.talkforum.talkforumserver.common.vo.PostListVO;
import com.talkforum.talkforumserver.constant.ServerConstant;
import com.talkforum.talkforumserver.constant.UserConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 帖子控制器
 * 处理帖子相关的HTTP请求，包括发布帖子、获取帖子列表、编辑帖子、删除帖子等
 */
@RequestMapping("/posts")
@RestController
public class PostController {
    @Autowired
    PostService postService; // 帖子服务层
    @Autowired
    JWTHelper jwtHelper; // JWT工具类，用于解析和生成Token

    /**
     * 根据帖子ID获取帖子详情
     * @param postId 帖子ID
     * @param token 登录凭证Token（可选）
     * @return 帖子详情
     */
    @GetMapping("/{postId}")
    public Result getPost(@PathVariable Long postId, @CookieValue(name = ServerConstant.LOGIN_COOKIE, required = false) String token) {
        // 解析Token获取用户ID，未登录则为null
        Long userId = null;
        if (token != null) {
            Map<String, Object> information = jwtHelper.parseJWTToken(token);
            userId = ((Number)information.get("id")).longValue();
        }
        
        return Result.success(I18n.t("post.get.success"), postService.getPost(postId, userId));
    }

    /**
     * 获取帖子列表
     * @param postRequestDTO 帖子列表请求DTO
     * @param token 登录凭证Token（可选）
     * @return 帖子列表
     */
    @GetMapping("/")
    @Validated
    public Result getPosts(PostRequestDTO postRequestDTO, @CookieValue(name = ServerConstant.LOGIN_COOKIE, required = false) String token) {
        // 解析Token获取用户ID，未登录则为null
        Long userId = null;
        try {
            if (token != null) {
                Map<String, Object> information = jwtHelper.parseJWTToken(token);
                userId = ((Number)information.get("id")).longValue();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        PostListVO postListVO = postService.getPosts(postRequestDTO, userId);
        return Result.success(I18n.t("post.list.success"), postListVO);
    }

    /**
     * 发布帖子
     * @param postCommitDTO 帖子发布DTO
     * @param token 登录凭证Token
     * @return 发布结果
     */
    @LoginRequired
    @PostMapping("/")
    @Validated
    public Result commitPost(@RequestBody PostCommitDTO postCommitDTO, @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token); // 解析Token获取用户信息
        postCommitDTO.userId = ((Number)(information.get("id"))).longValue(); // 设置用户ID
        String role = (String) information.get("role");
        return Result.success(
                role.equals(UserConstant.ROLE_USER) ?
                        I18n.t("post.commit.user.success") : I18n.t("post.commit.admin.success")
                ,postService.commitPost(postCommitDTO, role));
    }

    /**
     * 编辑帖子
     * @param postId 帖子ID
     * @param postEditDTO 帖子编辑DTO
     * @param token 登录凭证Token
     * @return 编辑结果
     */
    @LoginRequired
    @PutMapping("/{postId}")
    @Validated
    public Result editPost(@PathVariable Long postId, @RequestBody PostEditDTO postEditDTO, @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token); // 解析Token获取用户信息
        postEditDTO.userId = ((Number)(information.get("id"))).longValue(); // 设置用户ID
        postEditDTO.id = postId; // 设置帖子ID
        String role = (String) information.get("role");
        postService.editPost(postEditDTO, role); // 调用服务层编辑帖子
        return Result.success(role.equals(UserConstant.ROLE_USER) ?
                I18n.t("post.edit.user.success") : I18n.t("post.edit.admin.success"));
    }

    /**
     * 删除帖子
     * @param postId 帖子ID
     * @param token 登录凭证Token
     * @return 删除结果
     */
    @LoginRequired
    @DeleteMapping("/{postId}")
    public Result deletePost(@PathVariable Long postId, @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token); // 解析Token获取用户信息
        long userId = ((Number)(information.get("id"))).longValue(); // 获取用户ID
        String role = (String)(information.get("role")); // 获取用户角色
        postService.deletePost(postId, userId, role); // 调用服务层删除帖子
        return Result.success(I18n.t("post.delete.success"));
    }

    /**
     * 管理员获取帖子列表
     * @param adminPostRequestDTO 管理员帖子列表请求DTO
     * @param token 登录凭证Token
     * @return 帖子列表
     */
    @ModeratorRequired
    @GetMapping("/admin")
    @Validated
    public Result getPostsWithAdminRight(AdminPostRequestDTO adminPostRequestDTO, @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token) {
        // 管理员状态下不传递userId，不进行互动内容赋值
        return Result.success(I18n.t("post.admin.list.success"), postService.getPostsWithAdminRight(adminPostRequestDTO));
    }

    /**
     * 审核帖子
     * @param postId 帖子ID
     * @param postAuditDTO 帖子审核DTO
     * @return 审核结果
     */
    @ModeratorRequired
    @PutMapping("/admin/{postId}/audit")
    public Result auditPost(@PathVariable Long postId, @RequestBody PostAuditDTO postAuditDTO) {
        postService.auditPost(postId, postAuditDTO.getStatus()); // 调用服务层审核帖子
        return Result.success(I18n.t("post.audit.success"));
    }

    /**
     * 设置帖子精华
     * @param postId 帖子ID
     * @param essenceDTO 精华设置DTO
     * @return 设置结果
     */
    @ModeratorRequired
    @PutMapping("/admin/{postId}/essence")
    public Result essencePost(@PathVariable Long postId, @RequestBody EssenceDTO essenceDTO) {
        System.out.println(essenceDTO.getIsEssence()); // 打印日志
        postService.essencePost(postId, essenceDTO.getIsEssence()); // 调用服务层设置精华
        return Result.success(I18n.t("post.essence.success"));
    }

    /**
     * 管理员获得帖子内容
     * @param postId
     */
    @ModeratorRequired
    @GetMapping("/admin/{postId}/content")
    public Result getContent(@PathVariable Long postId) {
        return Result.success(I18n.t("post.admin.get.success"), postService.getContent(postId));
    }
}
