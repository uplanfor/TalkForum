package com.talkforum.talkforumserver.common.exception;

import com.talkforum.talkforumserver.common.result.Result;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Arrays;
import java.util.List;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Sensitive keywords to block (prevent technical details from leaking to frontend)
    private static final List<String> SENSITIVE_KEYWORDS = Arrays.asList(
            "NullPointerException", "SQL", "Error", "Exception", "Timeout",
            "Connection", "Database", "StackOverflow", "OutOfMemory", "Syntax"
    );

    /**
     * Handle your business RuntimeException (with pre-written user messages)
     * - Frontend gets your user-friendly message (if safe)
     * - Backend logs full debugging details
     */
    @ExceptionHandler(RuntimeException.class)
    public Result handleRuntimeException(HttpServletRequest request, RuntimeException e) {
        // 1. Basic request info (IP + API URI)
        String requestUri = request.getRequestURI();
        String clientIp = getRealClientIp(request);

        // 2. Get root cause and user-friendly message from YOUR RuntimeException
        Throwable rootCause = getRootCause(e);
        String userMessage = rootCause.getMessage();

        // 3. Parse debugging details (package/method names for backend logs)
        StackTraceElement[] stackTrace = rootCause.getStackTrace();
        String exceptionPackage = "Unknown";
        String exceptionMethod = "Unknown";
        String callerPackage = "None";
        String callerMethod = "None";

        if (stackTrace != null && stackTrace.length > 0) {
            // Exception-throwing package/method
            StackTraceElement exceptionElement = stackTrace[0];
            exceptionPackage = extractPackageName(exceptionElement.getClassName());
            exceptionMethod = String.format("%s.%s()", exceptionElement.getClassName(), exceptionElement.getMethodName());

            // Caller package/method (upper-level)
            if (stackTrace.length > 1) {
                StackTraceElement callerElement = stackTrace[1];
                callerPackage = extractPackageName(callerElement.getClassName());
                callerMethod = String.format("%s.%s()", callerElement.getClassName(), callerElement.getMethodName());
            }
        }

        // 4. Backend log: full details for debugging (NEVER expose this to frontend!)
        log.error("""
                [RuntimeException Occurred]
                Client IP: {}
                Requested API: {}
                Exception Type: {}
                User-Friendly Message: {}
                Exception Thrown From Package: {}
                Exception Thrown From Method: {}
                Caller Package: {}
                Caller Method: {}""",
                clientIp, requestUri,
                rootCause.getClass().getName(),
                userMessage, // Log your user message too
                exceptionPackage, exceptionMethod,
                callerPackage, callerMethod,
                rootCause // Log full stack trace (critical for debugging)
        );

        // 5. Return safe message to frontend: use your message if it's not sensitive
        String safeUserMessage = getSafeUserMessage(userMessage);
        return Result.error(safeUserMessage);
    }

    /**
     * Fallback handler for other exceptions (e.g., checked Exceptions, system errors)
     */
    @ExceptionHandler(Exception.class)
    public Result handleOtherException(HttpServletRequest request, Exception e) {
        String requestUri = request.getRequestURI();
        String clientIp = getRealClientIp(request);

        log.error("""
                [General Exception Occurred]
                Client IP: {}
                Requested API: {}
                Exception Type: {}
                Exception Message: {}""",
                clientIp, requestUri,
                e.getClass().getName(),
                e.getMessage(),
                e // Log full stack trace
        );

        // Return generic message (no technical details)
        return Result.error("System is busy, please contact administrator~");
    }

    // ---------------------- Utility Methods ----------------------
    /**
     * Get the root cause of the exception (penetrates wrapped exceptions)
     */
    private Throwable getRootCause(Throwable e) {
        Throwable rootCause = e;
        while (rootCause.getCause() != null && rootCause != rootCause.getCause()) {
            rootCause = rootCause.getCause();
        }
        return rootCause;
    }

    /**
     * Extract package name from full class name (e.g., com.talkforum.service.UserService → com.talkforum.service)
     */
    private String extractPackageName(String fullClassName) {
        if (fullClassName == null || fullClassName.isEmpty()) {
            return "Unknown";
        }
        int lastDotIndex = fullClassName.lastIndexOf('.');
        return lastDotIndex > 0 ? fullClassName.substring(0, lastDotIndex) : "Default Package";
    }

    /**
     * Get real client IP (handles reverse proxies/load balancers)
     */
    private String getRealClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
            String[] ipArray = ip.split(",");
            for (String tempIp : ipArray) {
                if (!"unknown".equalsIgnoreCase(tempIp.trim())) {
                    ip = tempIp.trim();
                    break;
                }
            }
            return ip;
        }

        ip = request.getHeader("Proxy-Client-IP");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }

        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }

        return "0:0:0:0:0:0:0:1".equals(ip) ? "127.0.0.1" : ip;
    }

    /**
     * Ensure the user message is safe (no sensitive technical details)
     */
    private String getSafeUserMessage(String userMessage) {
        // If message is null/empty, return generic prompt
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return "Operation failed, please try again later~";
        }

        // Block messages containing sensitive keywords
        String lowerCaseMessage = userMessage.toLowerCase();
        for (String keyword : SENSITIVE_KEYWORDS) {
            if (lowerCaseMessage.contains(keyword.toLowerCase())) {
                return "Operation failed, please try again later~";
            }
        }

        // Return your original user-friendly message if safe
        return userMessage;
    }
}