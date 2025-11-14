package com.talkforum.talkforumserver.comment.impl;

import com.talkforum.talkforumserver.comment.CommentMapper;
import com.talkforum.talkforumserver.comment.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(rollbackFor = Exception.class)
public class CommentServiceImpl implements CommentService {
    @Autowired
    CommentMapper commentMapper;
}
