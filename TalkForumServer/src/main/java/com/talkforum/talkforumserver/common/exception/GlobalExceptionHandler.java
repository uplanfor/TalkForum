package com.talkforum.talkforumserver.common.exception;

import com.talkforum.talkforumserver.common.result.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler
    public Result handleException(Exception e){
        log.error(e.getMessage());
        return Result.error(e.getMessage());
    }
}
