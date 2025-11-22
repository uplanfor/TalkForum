package com.talkforum.talkforumserver.post;

import com.talkforum.talkforumserver.common.dto.PostCommitDTO;
import com.talkforum.talkforumserver.common.dto.PostEditDTO;
import com.talkforum.talkforumserver.common.dto.PostRequestDTO;
import com.talkforum.talkforumserver.common.entity.Post;
import com.talkforum.talkforumserver.common.vo.PostVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface PostMapper {
    Post getPost(Long postId);
    List<PostVO> getPosts(PostRequestDTO postRequestDTO);
    int addPost(PostCommitDTO postCommitDTO, String status, String brief);
    int updatePost(PostEditDTO postEditDTO, String status, String brief);
    int deletePost(Long postId);
    int auditPost(Long postId);
    int essencePost(Long postId, int isEssence);
}
