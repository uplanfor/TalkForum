package com.talkforum.talkforumserver.interaction;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/interactions")
@RestController
public class InteractionController {
    @Autowired
    InteractionService interactionService;
}
