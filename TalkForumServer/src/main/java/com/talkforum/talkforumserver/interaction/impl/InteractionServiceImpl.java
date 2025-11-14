package com.talkforum.talkforumserver.interaction.impl;

import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.interaction.InteractionMapper;
import com.talkforum.talkforumserver.interaction.InteractionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(rollbackFor = Exception.class)
public class InteractionServiceImpl implements InteractionService {
    @Autowired
    private InteractionMapper interactionMapper;
}
