package com.talkforum.talkforumserver.post;

import com.talkforum.talkforumserver.common.anno.LoginRequired;
import com.talkforum.talkforumserver.common.anno.ModeratorRequired;
import com.talkforum.talkforumserver.common.dto.PostCommitDTO;
import com.talkforum.talkforumserver.common.dto.PostEditDTO;
import com.talkforum.talkforumserver.common.dto.PostRequestDTO;
import com.talkforum.talkforumserver.common.entity.Post;
import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.common.util.JWTHelper;
import com.talkforum.talkforumserver.common.vo.PostListVO;
import com.talkforum.talkforumserver.constant.ServerConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RequestMapping("/posts")
@RestController
public class PostController {
    @Autowired
    PostService postService;
    @Autowired
    JWTHelper jwtHelper;

    @GetMapping("/{postId}")
    public Result getPost(@PathVariable Long postId) {
        return Result.success("Success to get post information!", postService.getPost(postId));
    }

    @GetMapping("/")
    public Result getPosts(PostRequestDTO postRequestDTO) {
        PostListVO postListVO = postService.getPosts(postRequestDTO);
//        if (postListVO.getData().isEmpty()) {
//            return Result.error("No more posts!", postListVO);
//        }
        return Result.success("Success to get post list!", postService.getPosts(postRequestDTO));
    }

    @LoginRequired
    @PostMapping("/")
    public Result commitPost(@RequestBody PostCommitDTO postCommitDTO, @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token);
        postCommitDTO.userId = ((Number)(information.get("id"))).longValue();
        return Result.success("Success to commit post!", postService.commitPost(postCommitDTO, (String)(information.get("role"))));
    }

    @LoginRequired
    @PutMapping("/")
    public Result editPost(@RequestBody PostEditDTO postEditDTO, @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token);
        postEditDTO.userId = ((Number)(information.get("id"))).longValue();
        postService.editPost(postEditDTO, (String)(information.get("role")));
        return Result.success("Success to edit post!");
    }

    @LoginRequired
    @DeleteMapping("/{postId}")
    public Result deletePost(@PathVariable Long postId, @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token);
        long userId = ((Number)(information.get("id"))).longValue();
        String role = (String)(information.get("role"));
        postService.deletePost(postId, userId, role);
        return Result.success("Success to delete post!");
    }

    @ModeratorRequired
    @PutMapping("/{postId}/audit")
    public Result auditPost(@PathVariable Long postId) {
        postService.auditPost(postId);
        return Result.success("Success to audit post!");
    }

    @ModeratorRequired
    @PutMapping("/{postId}/essence")
    public Result essencePost(@PathVariable Long postId, int isEssence) {
        postService.essencePost(postId, isEssence);
        return Result.success("Success to modify!");
    }
}
