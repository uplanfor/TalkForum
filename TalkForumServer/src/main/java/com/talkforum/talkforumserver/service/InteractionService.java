package com.talkforum.talkforumserver.service;

import com.talkforum.talkforumserver.common.dto.InteractionRequestDTO;
import com.talkforum.talkforumserver.common.result.Result;

public interface InteractionService {
    Result<Object> makeInteraction(InteractionRequestDTO interactionRequestDTO);
}
