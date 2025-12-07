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
import com.talkforum.talkforumserver.constant.InteractionConstant;
import com.talkforum.talkforumserver.constant.PostConstant;
import com.talkforum.talkforumserver.constant.UserConstant;
import com.talkforum.talkforumserver.interaction.InteractionMapper;
import com.talkforum.talkforumserver.post.PostMapper;
import com.talkforum.talkforumserver.post.PostService;
import com.talkforum.talkforumserver.user.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 帖子服务实现类
 * 实现了PostService接口，处理帖子相关的业务逻辑
 */
@Service
@Transactional(rollbackFor = Exception.class)
public class PostServiceImpl implements PostService {
    /**
     * 帖子数据访问层接口
     */
    @Autowired
    private PostMapper postMapper;
    
    /**
     * 互动数据访问层接口
     */
    @Autowired
    private InteractionMapper interactionMapper;
    @Autowired
    private UserMapper userMapper;

    /**
     * 根据帖子ID获取帖子信息
     * @param postId 帖子ID
     * @param userId 用户ID
     * @return 帖子VO对象，包含互动内容
     */
    @Override
    public PostVO getPost(Long postId, Long userId) {
        // 查询帖子VO
        PostVO postVO = postMapper.getPostVO(postId);
        
        // 为帖子设置互动内容
        if (postVO != null) {
            if (userId == null) {
                postVO.setInteractContent(0);
            } else {
                // 查询用户对该帖子的互动内容
                List<Integer> interactContents = interactionMapper.queryInteractContentByPostOrComment(InteractionConstant.INTERACTION_TYPE_POST, new Long[]{postId}, userId);
                postVO.setInteractContent(interactContents != null && !interactContents.isEmpty() ? interactContents.get(0) : 0);
            }
        }
        
        return postVO;
    }

    /**
     * 获取帖子列表
     * @param postRequestDTO 帖子请求DTO，包含分页、排序等参数
     * @return 帖子列表VO，包含帖子列表、是否有更多和游标信息
     */
    @Override
    public PostListVO getPosts(PostRequestDTO postRequestDTO, Long userId) {
        // 查询帖子列表
        List<PostVO> posts = postMapper.getPosts(postRequestDTO);
        
        // 为每个帖子设置用户互动内容
        setPostInteractionContent(posts, userId);
        
        // 判断是否有更多帖子
        boolean hasMore = posts.size() == postRequestDTO.getPageSize();
        // 设置游标，用于分页查询
        Long cursor = hasMore ? posts.get(posts.size() - 1).id : null;
        return new PostListVO(posts, hasMore, cursor);
    }

    /**
     * 发布帖子
     * @param postCommitDTO 帖子提交DTO，包含帖子标题、内容等信息
     * @param role 用户角色
     * @return 发布后的帖子实体对象
     */
    @Override
    public Post commitPost(PostCommitDTO postCommitDTO, String role) {
        // 调用Mapper添加帖子，根据用户角色设置审核状态
        // 普通用户发布的帖子需要审核，管理员发布的帖子直接通过
        postMapper.addPost(postCommitDTO,
                role.equals(UserConstant.ROLE_USER) ? PostConstant.PENDING : PostConstant.PASS,
                MarkdownIntroHelper.getIntro(postCommitDTO.content, PostConstant.MAX_POST_LENGTH));
        // 返回发布后的帖子信息
        return postMapper.getPost(postCommitDTO.id);
    }

    /**
     * 编辑帖子
     * @param postEditDTO 帖子编辑DTO，包含帖子标题、内容等信息
     * @param role 用户角色
     */
    @Override
    public void editPost(PostEditDTO postEditDTO,  String role) {
        // 调用Mapper更新帖子，根据用户角色设置审核状态
        // 普通用户编辑的帖子需要重新审核，管理员编辑的帖子直接通过
        postMapper.updatePost(postEditDTO,
                role.equals(UserConstant.ROLE_USER) ? PostConstant.PENDING : PostConstant.PASS,
                MarkdownIntroHelper.getIntro(postEditDTO.content, PostConstant.MAX_POST_LENGTH));
    }

    /**
     * 删除帖子
     * @param postId 帖子ID
     * @param userId 用户ID
     * @param role 用户角色
     * @throws RuntimeException 当帖子不存在或无权限删除时抛出
     */
    @Override
    public void deletePost(Long postId, long userId, String role) {
        // 查询帖子信息，检查帖子是否存在
        Post post = postMapper.getPostCheck(postId);
        if (post == null) {
            throw new RuntimeException("the post is null!");
        }
        // 如果是帖子作者，可以直接删除
        if (post.userId == userId) {
            postMapper.deletePost(postId);
        } else {
            // 不是作者，需要管理员或版主权限才能删除
            if (!role.equals(UserConstant.ROLE_USER)) {
                postMapper.deletePost(postId);
            } else {
                throw new RuntimeException("You are not allowed to delete this post!");
            }
        }
    }

    /**
     * 管理员获取帖子列表
     * @param adminPostRequestDTO 管理员帖子请求DTO，包含分页、筛选等参数
     * @return 分页后的帖子列表VO
     */
    @Override
    public PageVO<PostVO> getPostsWithAdminRight(AdminPostRequestDTO adminPostRequestDTO) {
        // 管理员查询帖子列表
        List<PostVO> list = postMapper.adminGetPosts(adminPostRequestDTO);
        // 计算总帖子数
        long total = postMapper.adminCountPosts(adminPostRequestDTO);
        
        // 管理员状态下直接忽略互动内容的赋值
        
        return new PageVO<>(list, total);
    }

    /**
     * 审核帖子
     * @param postId 帖子ID
     * @param status 审核状态
     */
    @Override
    public void auditPost(Long postId, String status) {
        // 调用Mapper更新帖子审核状态
        postMapper.auditPost(postId, status);
    }

    /**
     * 设置帖子精华
     * @param postId 帖子ID
     * @param isEssence 是否精华（0：非精华，1：精华）
     */
    @Override
    public void essencePost(Long postId, int isEssence) {
        // 调用Mapper更新帖子精华状态
        postMapper.essencePost(postId, isEssence);
    }

    @Override
    public String getContent(Long postId) {
        return postMapper.getContent(postId);
    }
    
    /**
     * 为帖子列表设置用户互动内容
     * @param posts 帖子列表
     * @param userId 用户ID
     */
    private void setPostInteractionContent(List<PostVO> posts, Long userId) {
        if (posts.isEmpty() || userId == null) {
            // 如果帖子列表为空或用户未登录，设置互动内容为0
            for (PostVO post : posts) {
                post.setInteractContent(0);
            }
            return;
        }
        
        // 提取帖子ID
        Long[] postIds = posts.stream().map(PostVO::getId).toArray(Long[]::new);
        
        // 查询用户对这些帖子的互动内容
        List<Integer> interactContents = interactionMapper.queryInteractContentByPostOrComment("post", postIds, userId);
        
        // 创建帖子ID到互动内容的映射
        Map<Long, Integer> interactContentMap = new HashMap<>();
        for (int i = 0; i < postIds.length && i < interactContents.size(); i++) {
            interactContentMap.put(postIds[i], interactContents.get(i));
        }
        
        // 为每个帖子设置对应的互动内容
        for (PostVO post : posts) {
            post.setInteractContent(interactContentMap.getOrDefault(post.getId(), 0));
        }
    }
}
