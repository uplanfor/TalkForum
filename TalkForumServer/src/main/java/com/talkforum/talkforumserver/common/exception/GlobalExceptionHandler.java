package com.talkforum.talkforumserver.common.exception;

import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.common.util.I18n;
import com.talkforum.talkforumserver.common.util.IpHelper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 处理自定义业务异常：直接返回异常的 getMessage()
     */
    @ExceptionHandler(BusinessRuntimeException.class)
    public Result<Object> handleBusinessRuntimeException(HttpServletRequest request, BusinessRuntimeException e) {
        // 1. 获取请求核心信息（用于日志排查）
        String clientIp = IpHelper.getRealIp(request);
        String requestUri = request.getRequestURI();
        String exceptionMsg = e.getMessage();
        String exceptionType = e.getClass().getName();

        // 2. 记录业务异常日志（含完整堆栈，便于定位问题）
        log.error("""
                [BUSINESS EXCEPTION OCCURRED!]
                client ip: {}
                request url: {}
                exception type: {}
                original message: {}""",
                clientIp, requestUri, exceptionType, exceptionMsg, e); // 最后一个 e 输出完整堆栈

        // 3. 直接返回自定义异常的消息（无需过滤，业务异常消息由开发者控制）
        return Result.error(exceptionMsg);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Object> handleValidationException(MethodArgumentNotValidException e) {
        BindingResult bindingResult = e.getBindingResult();
        // 第一行固定文本，后续每个错误单独换行
        StringBuilder errorMsg = new StringBuilder();

        // 提取所有字段的错误信息，每个错误单独一行
        for (FieldError fieldError : bindingResult.getFieldErrors()) {
            String field = fieldError.getField(); // 违规字段名
            String message = fieldError.getDefaultMessage(); // 自定义错误提示
            // 换行 + [字段名]: 错误提示;
            errorMsg.append("\n[").append(field).append("]: ").append(message);
        }

        // 日志记录（保持原有逻辑，输出完整错误信息）

        log.warn("[INVALID DTO CHECK] CLASS {} {}",  e.getParameter().getParameterType().getSimpleName(), errorMsg.toString().trim());

        // 直接返回拼接后的错误信息（无需去掉结尾分号，按目标格式保留）
        return Result.error(errorMsg.toString());
    }

    /**
     * 兜底处理所有其他异常：统一返回 "Server Error 500"
     */
    @ExceptionHandler(Exception.class) // 匹配所有 Exception 子类（含 RuntimeException）
    public Result<Object> handleAllOtherExceptions(HttpServletRequest request, Exception e) {
        // 1. 获取请求核心信息（用于日志排查）
        String clientIp = IpHelper.getRealIp(request);
        String requestUri = request.getRequestURI();
        String exceptionType = e.getClass().getName();
        String exceptionMsg = e.getMessage();

        // 2. 记录系统异常日志（含完整堆栈，关键排查依据）
        log.error("""
                [EXCEPTION OCCURRED!]
                client ip: {}
                request uri: {}
                exception type: {}
                original message: {}""",
                clientIp, requestUri, exceptionType, exceptionMsg, e); // 输出完整堆栈

        // 3. 统一返回固定提示（避免泄露技术细节）
        return Result.error(I18n.t("common.server.error"));
    }

}