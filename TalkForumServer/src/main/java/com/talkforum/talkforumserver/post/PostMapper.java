package com.talkforum.talkforumserver.post;

import com.talkforum.talkforumserver.common.dto.PostCommitDTO;
import com.talkforum.talkforumserver.common.dto.PostEditDTO;
import com.talkforum.talkforumserver.common.dto.PostRequestDTO;
import com.talkforum.talkforumserver.common.entity.Post;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface PostMapper {
    Post getPost(Long postId);
    List<Post> getPosts(PostRequestDTO postRequestDTO);
    int addPost(PostCommitDTO postCommitDTO, String status);
    int updatePost(PostEditDTO postEditDTO, String status);
    int deletePost(Long postId);
    int auditPost(Long postId);
    int essencePost(Long postId, int isEssence);
}
