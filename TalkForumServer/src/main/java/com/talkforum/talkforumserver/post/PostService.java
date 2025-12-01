package com.talkforum.talkforumserver.post;

import com.talkforum.talkforumserver.common.dto.AdminPostRequestDTO;
import com.talkforum.talkforumserver.common.dto.PostEditDTO;
import com.talkforum.talkforumserver.common.result.Result;

import com.talkforum.talkforumserver.common.dto.PostCommitDTO;
import com.talkforum.talkforumserver.common.dto.PostRequestDTO;
import com.talkforum.talkforumserver.common.entity.Post;
import com.talkforum.talkforumserver.common.vo.PageVO;
import com.talkforum.talkforumserver.common.vo.PostListVO;
import com.talkforum.talkforumserver.common.vo.PostVO;

import java.util.List;

public interface PostService {
    Post getPost(Long postId);
    PostListVO getPosts(PostRequestDTO postRequestDTO);
    Post commitPost(PostCommitDTO postCommitDTO, String role);
    void editPost(PostEditDTO postEditDTO, String role);
    void deletePost(Long postId, long userId, String role);

    PageVO<PostVO> getPostsWithAdminRight(AdminPostRequestDTO adminPostRequestDTO);
    void auditPost(Long postId, String status);
    void essencePost(Long postId, int isEssence);
}
