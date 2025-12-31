package com.talkforum.talkforumserver.controller;

import com.talkforum.talkforumserver.common.anno.LoginRequired;
import com.talkforum.talkforumserver.common.dto.InteractionRequestDTO;
import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.common.util.JWTHelper;
import com.talkforum.talkforumserver.constant.ServerConstant;
import com.talkforum.talkforumserver.service.InteractionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(
    name = "用户互动管理",
    description = "用户互动相关接口，包括帖子点赞/点踩、评论点赞/点踩、用户关注/取关等互动操作"
)
@RequestMapping("/interactions")
@RestController
public class InteractionController {
    @Autowired
    InteractionService interactionService;
    @Autowired
    JWTHelper jwtHelper;

    @Operation(
        summary = "执行用户互动操作",
        description = "用户执行各种互动操作，包括帖子点赞/点踩、评论点赞/点踩、用户关注/取关等，需要用户登录状态"
    )
    @PostMapping("/")
    @LoginRequired
    @Validated
    public Result makeInteractions(
            @Parameter(
                description = "互动请求参数，包含互动类型、目标ID和互动内容",
                required = true,
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(
                        implementation = InteractionRequestDTO.class,
                        description = "用户互动请求参数对象"
                    )
                )
            )
            @RequestBody InteractionRequestDTO interactionRequestDTO,
            @Parameter(
                description = "用户登录凭证Cookie",
                example = "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MTIzNDU2Nzg5MCwidXNlcm5hbWUiOiJ0ZXN0dXNlciJ9.signature",
                required = true,
                hidden = true
            )
            @CookieValue(name = ServerConstant.LOGIN_COOKIE) String token) {
        Map<String, Object> information = jwtHelper.parseJWTToken(token);

        interactionRequestDTO.setUserId(((Number)(information.get("id"))).longValue());
        return interactionService.makeInteraction(interactionRequestDTO);
    }
}
