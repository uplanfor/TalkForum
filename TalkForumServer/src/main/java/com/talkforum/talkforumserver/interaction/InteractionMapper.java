package com.talkforum.talkforumserver.interaction;

import com.talkforum.talkforumserver.common.dto.InteractionRequestDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface InteractionMapper {
    public int makeInteractionWithUser(InteractionRequestDTO interactionRequestDTO);
    public int makeInteractionWithPost(InteractionRequestDTO interactionRequestDTO);
    public int makeInteractionWithComment(InteractionRequestDTO interactionRequestDTO);
    public List<Integer> queryInteractContentByPostOrComment(String interactTargetType, Long[] interactTargets, Long userId);
    public List<Long> queryInteractFollowingByUserId(Long userId);

}
