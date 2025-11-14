package com.talkforum.talkforumserver.post;

import com.talkforum.talkforumserver.common.dto.PostEditDTO;
import com.talkforum.talkforumserver.common.result.Result;

import com.talkforum.talkforumserver.common.dto.PostCommitDTO;
import com.talkforum.talkforumserver.common.dto.PostRequestDTO;
import com.talkforum.talkforumserver.common.entity.Post;

import java.util.List;

public interface PostService {
    Post getPost(Long postId);
    List<Post> getPosts(PostRequestDTO postRequestDTO);
    Post commitPost(PostCommitDTO postCommitDTO, String role);
    void editPost(PostEditDTO postEditDTO, String role);
    void deletePost(Long postId, long userId, String role);
    void auditPost(Long postId);
    void essencePost(Long postId, int isEssence);
}
