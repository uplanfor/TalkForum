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

/**
 * 帖子服务接口
 * 定义了帖子相关的业务逻辑方法
 */
public interface PostService {
    /**
     * 根据帖子ID获取帖子信息
     * @param postId 帖子ID
     * @param userId 用户ID
     * @return 帖子VO对象，包含互动内容
     */
    PostVO getPost(Long postId, Long userId);
    
    /**
     * 获取帖子列表
     * @param postRequestDTO 帖子请求DTO，包含分页、排序等参数
     * @return 帖子列表VO，包含帖子列表、是否有更多和游标信息
     */
    PostListVO getPosts(PostRequestDTO postRequestDTO, Long userId);
    
    /**
     * 发布帖子
     * @param postCommitDTO 帖子提交DTO，包含帖子标题、内容等信息
     * @param role 用户角色
     * @return 发布后的帖子实体对象
     */
    Post commitPost(PostCommitDTO postCommitDTO, String role);
    
    /**
     * 编辑帖子
     * @param postEditDTO 帖子编辑DTO，包含帖子标题、内容等信息
     * @param role 用户角色
     */
    void editPost(PostEditDTO postEditDTO, String role);
    
    /**
     * 删除帖子
     * @param postId 帖子ID
     * @param userId 用户ID
     * @param role 用户角色
     */
    void deletePost(Long postId, long userId, String role);

    /**
     * 管理员获取帖子列表
     * @param adminPostRequestDTO 管理员帖子请求DTO，包含分页、筛选等参数
     * @return 分页后的帖子列表VO
     */
    PageVO<PostVO> getPostsWithAdminRight(AdminPostRequestDTO adminPostRequestDTO);
    
    /**
     * 审核帖子
     * @param postId 帖子ID
     * @param status 审核状态
     */
    void auditPost(Long postId, String status);
    
    /**
     * 设置帖子精华
     * @param postId 帖子ID
     * @param isEssence 是否精华（0：非精华，1：精华）
     */
    void essencePost(Long postId, int isEssence);

    /**
     * 获得帖子内容
     * @param postId
     * @return 帖子内容
     */
    String getContent(Long postId);
}
