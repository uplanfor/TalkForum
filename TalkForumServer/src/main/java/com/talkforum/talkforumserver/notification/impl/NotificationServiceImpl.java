package com.talkforum.talkforumserver.notification.impl;

import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.notification.NotificationMapper;
import com.talkforum.talkforumserver.notification.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(rollbackFor = Exception.class)
public class NotificationServiceImpl implements NotificationService {
    @Autowired
    private NotificationMapper notificationMapper;
}
