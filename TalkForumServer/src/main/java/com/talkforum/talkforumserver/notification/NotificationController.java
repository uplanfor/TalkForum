package com.talkforum.talkforumserver.notification;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/notifycations")
@RestController
public class NotificationController {
    @Autowired
    NotificationService notificationService;
}
