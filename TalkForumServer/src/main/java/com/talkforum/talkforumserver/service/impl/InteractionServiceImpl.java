package com.talkforum.talkforumserver.service.impl;

import com.talkforum.talkforumserver.common.dto.InteractionRequestDTO;
import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.constant.InteractionConstant;
import com.talkforum.talkforumserver.mapper.InteractionMapper;
import com.talkforum.talkforumserver.service.InteractionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(rollbackFor = Exception.class)
public class InteractionServiceImpl implements InteractionService {
    @Autowired
    private InteractionMapper interactionMapper;


    @Override
    public Result makeInteraction(InteractionRequestDTO interactionRequestDTO) {
        switch (interactionRequestDTO.getInteractType()) {
            case InteractionConstant.INTERACTION_TYPE_POST: {
                interactionMapper.makeInteractionWithPost(interactionRequestDTO);
                break;
            }
            case InteractionConstant.INTERACTION_TYPE_COMMENT:{
                interactionMapper.makeInteractionWithComment(interactionRequestDTO);
                break;
            }
            case InteractionConstant.INTERACTION_TYPE_USER: {
                System.out.println(interactionRequestDTO);
                interactionMapper.makeInteractionWithUser(interactionRequestDTO);
                if (interactionRequestDTO.getInteractContent() == InteractionConstant.USER_FOLLOWING) {
                    return Result.success("Success to follow!");
                } else {
                    return Result.success("Success to unfollow!");
                }
//                break;
            }
            default: {
                return Result.error("Unknown interaction type!");
            }
        }
        return Result.success();
    }
}
