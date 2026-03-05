package com.talkforum.talkforumserver.mapper;

import com.talkforum.talkforumserver.common.dto.InteractionRequestDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface InteractionMapper {
    int makeInteractionWithUser(InteractionRequestDTO interactionRequestDTO);
    int makeInteractionWithPost(InteractionRequestDTO interactionRequestDTO);
    int makeInteractionWithComment(InteractionRequestDTO interactionRequestDTO);
    List<Integer> queryInteractContentByPostOrComment(String interactTargetType, Long[] interactTargets, Long userId);
    List<Long> queryInteractFollowingByUserId(Long userId);

}
