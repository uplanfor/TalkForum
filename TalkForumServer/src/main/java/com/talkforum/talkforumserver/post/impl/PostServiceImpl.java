package com.talkforum.talkforumserver.post.impl;

import com.talkforum.talkforumserver.common.dto.AdminPostRequestDTO;
import com.talkforum.talkforumserver.common.dto.PostCommitDTO;
import com.talkforum.talkforumserver.common.dto.PostEditDTO;
import com.talkforum.talkforumserver.common.dto.PostRequestDTO;
import com.talkforum.talkforumserver.common.entity.Post;
import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.common.util.MarkdownIntroHelper;
import com.talkforum.talkforumserver.common.vo.PageVO;
import com.talkforum.talkforumserver.common.vo.PostListVO;
import com.talkforum.talkforumserver.common.vo.PostVO;
import com.talkforum.talkforumserver.constant.PostConstant;
import com.talkforum.talkforumserver.constant.UserConstant;
import com.talkforum.talkforumserver.post.PostMapper;
import com.talkforum.talkforumserver.post.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(rollbackFor = Exception.class)
public class PostServiceImpl implements PostService {
    @Autowired
    private PostMapper postMapper;

    @Override
    public Post getPost(Long postId) {
        return postMapper.getPost(postId);
    }

    @Override
    public PostListVO getPosts(PostRequestDTO postRequestDTO) {
        List<PostVO> posts = postMapper.getPosts(postRequestDTO);

        boolean hasMore = posts.size() == postRequestDTO.getPageSize();
        Long cursor = hasMore ? posts.get(posts.size() - 1).id : null;
        return new PostListVO(posts, hasMore, cursor);
    }

    @Override
    public Post commitPost(PostCommitDTO postCommitDTO, String role) {
        postMapper.addPost(postCommitDTO,
                role.equals(UserConstant.ROLE_USER) ? PostConstant.PENDING : PostConstant.PASS,
                MarkdownIntroHelper.getIntro(postCommitDTO.content, PostConstant.MAX_POST_LENGTH));
        return postMapper.getPost(postCommitDTO.id);
    }

    @Override
    public void editPost(PostEditDTO postEditDTO,  String role) {
        postMapper.updatePost(postEditDTO,
                role.equals(UserConstant.ROLE_USER) ? PostConstant.PENDING : PostConstant.PASS,
                MarkdownIntroHelper.getIntro(postEditDTO.content, PostConstant.MAX_POST_LENGTH));
    }

    @Override
    public void deletePost(Long postId, long userId, String role) {
        Post post = postMapper.getPostCheck(postId);
        if (post == null) {
            throw new RuntimeException("the post is null!");
        }
        if (post.userId == userId) {
            postMapper.deletePost(postId);
        } else {
            if (!role.equals(UserConstant.ROLE_USER)) {
                postMapper.deletePost(postId);
            } else {
                throw new RuntimeException("You are not allowed to delete this post!");
            }
        }
    }

    @Override
    public PageVO<PostVO> getPostsWithAdminRight(AdminPostRequestDTO adminPostRequestDTO) {
        List<PostVO> list = postMapper.adminGetPosts(adminPostRequestDTO);
        return new PageVO<>(list, postMapper.adminCountPosts(adminPostRequestDTO));
    }


    @Override
    public void auditPost(Long postId) {
        postMapper.auditPost(postId);
    }

    @Override
    public void essencePost(Long postId, int isEssence) {
        postMapper.essencePost(postId, isEssence);
    }
}
