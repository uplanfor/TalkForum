package com.talkforum.talkforumserver.post;

import com.talkforum.talkforumserver.common.anno.LoginRequired;
import com.talkforum.talkforumserver.common.anno.ModeratorRequired;
import com.talkforum.talkforumserver.common.dto.PostCommitDTO;
import com.talkforum.talkforumserver.common.dto.PostEditDTO;
import com.talkforum.talkforumserver.common.dto.PostRequestDTO;
import com.talkforum.talkforumserver.common.entity.Post;
import com.talkforum.talkforumserver.common.util.JWTHelper;
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
    public Post getPost(@PathVariable Long postId) {
        return postService.getPost(postId);
    }

    @GetMapping("/")
    public List<Post> getPosts(PostRequestDTO postRequestDTO) {
        return postService.getPosts(postRequestDTO);
    }

    @LoginRequired
    @PostMapping("/")
    public Post commitPost(PostCommitDTO postCommitDTO, @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token) {
        Map<String, Object> infomation = jwtHelper.parseJWTToken(token);
        postCommitDTO.userId = (long)(infomation.get("id"));
        return postService.commitPost(postCommitDTO, (String)(infomation.get("role")));
    }

    @LoginRequired
    @PutMapping("/")
    public void editPost(PostEditDTO postEditDTO, @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token) {
        Map<String, Object> infomation = jwtHelper.parseJWTToken(token);
        postEditDTO.userId = (long)(infomation.get("id"));
        postService.editPost(postEditDTO, (String)(infomation.get("role")));
    }

    @LoginRequired
    @DeleteMapping("/{postId}")
    public void deletePost(@PathVariable Long postId, @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token) {
        Map<String, Object> infomation = jwtHelper.parseJWTToken(token);
        long userId = (long)(infomation.get("id"));
        String role = (String)(infomation.get("role"));
        postService.deletePost(postId, userId, role );
    }

    @ModeratorRequired
    @PutMapping("/{postId}/audit")
    public void auditPost(@PathVariable Long postId) {
        postService.auditPost(postId);
    }

    @ModeratorRequired
    @PutMapping("/{postId}/essence")
    public void essencePost(@PathVariable Long postId, int isEssence) {
        postService.essencePost(postId, isEssence);
    }
}
