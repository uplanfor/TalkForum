package com.talkforum.talkforumserver.apply.impl;

import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.apply.ApplyMapper;
import com.talkforum.talkforumserver.apply.ApplyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(rollbackFor = Exception.class)
public class ApplyServiceImpl implements ApplyService {
    @Autowired
    private ApplyMapper applyMapper;
}
