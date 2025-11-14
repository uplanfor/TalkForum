package com.talkforum.talkforumserver.apply;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/applies")
@RestController
public class ApplyController {
    @Autowired
    ApplyService applyService;
}
