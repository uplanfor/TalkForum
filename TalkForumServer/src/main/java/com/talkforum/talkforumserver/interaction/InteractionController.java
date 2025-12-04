package com.talkforum.talkforumserver.interaction;

import com.talkforum.talkforumserver.common.anno.LoginRequired;
import com.talkforum.talkforumserver.common.dto.InteractionRequestDTO;
import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.common.util.JWTHelper;
import com.talkforum.talkforumserver.constant.ServerConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RequestMapping("/interactions")
@RestController
public class InteractionController {
    @Autowired
    InteractionService interactionService;
    @Autowired
    JWTHelper jwtHelper;

    @PostMapping("/")
    @LoginRequired
    @Validated
    public Result makeInteractions(
            @RequestBody InteractionRequestDTO interactionRequestDTO,
            @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token);

        interactionRequestDTO.setUserId(((Number)(information.get("id"))).longValue());
        return interactionService.makeInteraction(interactionRequestDTO);
    }
}
