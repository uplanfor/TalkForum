package com.talkforum.talkforumserver.common.exception;

import com.talkforum.talkforumserver.common.result.Result;
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
    @ExceptionHandler(BusinessRuntimeException.class) // 严格匹配你的自定义异常类名（含拼写）
    public Result handleBusinessRuntimeException(HttpServletRequest request, BusinessRuntimeException e) {
        // 1. 获取请求核心信息（用于日志排查）
        String clientIp = getRealClientIp(request);
        String requestUri = request.getRequestURI();
        String exceptionMsg = e.getMessage();
        String exceptionType = e.getClass().getName();

        // 2. 记录业务异常日志（含完整堆栈，便于定位问题）
        log.error("""
                [exception occurred]
                client ip: {}
                request uri: {}
                exception type: {}
                original message: {}""",
                clientIp, requestUri, exceptionType, exceptionMsg, e); // 最后一个 e 输出完整堆栈

        // 3. 直接返回自定义异常的消息（无需过滤，业务异常消息由开发者控制）
        return Result.error(exceptionMsg);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result handleValidationException(MethodArgumentNotValidException e) {
        BindingResult bindingResult = e.getBindingResult();
        // 第一行固定文本，后续每个错误单独换行
        StringBuilder errorMsg = new StringBuilder("failed to validate arguments:");

        // 提取所有字段的错误信息，每个错误单独一行
        for (FieldError fieldError : bindingResult.getFieldErrors()) {
            String field = fieldError.getField(); // 违规字段名
            String message = fieldError.getDefaultMessage(); // 自定义错误提示
            // 换行 + [字段名]: 错误提示;
            errorMsg.append("\n[").append(field).append("]: ").append(message);
        }

        // 日志记录（保持原有逻辑，输出完整错误信息）
        log.warn("DTO validate failed：{}", errorMsg.toString().trim());

        // 直接返回拼接后的错误信息（无需去掉结尾分号，按目标格式保留）
        return Result.error(errorMsg.toString());
    }

    /**
     * 兜底处理所有其他异常：统一返回 "Server Error 500"
     */
    @ExceptionHandler(Exception.class) // 匹配所有 Exception 子类（含 RuntimeException）
    public Result handleAllOtherExceptions(HttpServletRequest request, Exception e) {
        // 1. 获取请求核心信息（用于日志排查）
        String clientIp = getRealClientIp(request);
        String requestUri = request.getRequestURI();
        String exceptionType = e.getClass().getName();
        String exceptionMsg = e.getMessage();

        // 2. 记录系统异常日志（含完整堆栈，关键排查依据）
        log.error("""
                [exception occurred]
                client ip: {}
                request uri: {}
                exception type: {}
                original message: {}""",
                clientIp, requestUri, exceptionType, exceptionMsg, e); // 输出完整堆栈

        // 3. 统一返回固定提示（避免泄露技术细节）
        return Result.error("Server Error!");
    }

    /**
     * 工具方法：获取客户端真实IP（兼容反向代理、负载均衡场景）
     */
    private String getRealClientIp(HttpServletRequest request) {
        // 优先从反向代理头获取
        String ip = request.getHeader("X-Forwarded-For");
        if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip.trim())) {
            // 多个IP时取第一个（X-Forwarded-For 格式：clientIp, proxyIp1, proxyIp2）
            String[] ipArray = ip.split(",");
            for (String tempIp : ipArray) {
                String trimIp = tempIp.trim();
                if (!"unknown".equalsIgnoreCase(trimIp)) {
                    ip = trimIp;
                    break;
                }
            }
            return ip;
        }

        // 备选：Proxy-Client-IP（部分代理服务器使用）
        ip = request.getHeader("Proxy-Client-IP");
        if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip.trim())) {
            return ip.trim();
        }

        // 备选：WL-Proxy-Client-IP（WebLogic 代理）
        ip = request.getHeader("WL-Proxy-Client-IP");
        if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip.trim())) {
            return ip.trim();
        }

        // 最后取原生 RemoteAddr（本地环境可能是 0:0:0:0:0:0:0:1，转为 127.0.0.1）
        ip = request.getRemoteAddr();
        return "0:0:0:0:0:0:0:1".equals(ip) ? "127.0.0.1" : ip;
    }
}