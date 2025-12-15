package com.talkforum.talkforumserver.post;

import com.talkforum.talkforumserver.common.dto.AdminPostRequestDTO;
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
    PostVO getPostVO(Long postId);
    Post getPostCheck(Long postId);
    List<PostVO> getPosts(PostRequestDTO postRequestDTO);
    long countPassPost(Long postId);
    int addPost(PostCommitDTO postCommitDTO, String status, String brief, String coverUrl);
    int updatePost(PostEditDTO postEditDTO, String status, String brief, String coverUrl);
    int deletePost(Long postId);

    List<PostVO> adminGetPosts(AdminPostRequestDTO adminPostRequestDTO);
    long adminCountPosts(AdminPostRequestDTO adminPostRequestDTO);
    int auditPost(Long postId, String status);
    int essencePost(Long postId, int isEssence);
    void increaseViewCount(Long postId);

    String getContent(Long postId);
}
