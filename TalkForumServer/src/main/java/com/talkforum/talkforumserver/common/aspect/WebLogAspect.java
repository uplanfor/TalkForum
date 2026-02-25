package com.talkforum.talkforumserver.common.aspect;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Pattern;

/**
 * 优化后的Controller调用日志切面：解决线程安全、IP获取、脱敏、日志可读性等问题
 */
@Slf4j
@Aspect
@Component
public class WebLogAspect {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private final ObjectMapper objectMapper;

    // 内网IP正则（排除内网IP，只取公网IP）
    private static final Pattern INNER_IP_PATTERN = Pattern.compile(
            "(^127\\.)|(^10\\.)|(^172\\.1[6-9]\\.)|(^172\\.2[0-9]\\.)|(^172\\.3[0-1]\\.)|(^192\\.168\\.)|(^0:0:0:0:0:0:0:1$)"
    );

    public WebLogAspect() {
        this.objectMapper = new ObjectMapper();
        objectMapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        JavaTimeModule javaTimeModule = new JavaTimeModule();
        javaTimeModule.addSerializer(LocalDateTime.class, new LocalDateTimeSerializer(DATE_TIME_FORMATTER));
        objectMapper.registerModule(javaTimeModule);
    }

    /**
     * 修复切入点：匹配所有子包下的Controller（用..通配符）
     */
    @Pointcut("execution(* com.talkforum.talkforumserver.*.*Controller.*(..))")
    public void controllerPointCut() {}

    /**
     * 环绕通知：优化日志格式、异常上下文、脱敏、大对象处理
     */
    @Around("controllerPointCut()")
    public Object logControllerCall(ProceedingJoinPoint joinPoint) throws Throwable {
        // 初始化基础变量，避免NPE
        String requestMethod = "UNKNOWN";
        String requestUri = "UNKNOWN";
        String ip = "UNKNOWN";
        String traceId = MDC.get("traceId") != null ? MDC.get("traceId") : UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        Map<String, Object> paramMap = new HashMap<>();

        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            // 异步请求无上下文时，直接执行方法，不打印Web相关日志
            log.warn("[{}] 无请求上下文，跳过Web日志打印", traceId);
            return joinPoint.proceed();
        }

        try {
            HttpServletRequest request = attributes.getRequest();
            requestMethod = request.getMethod();
            requestUri = request.getRequestURI();
            ip = getRealIp(request);

            // 获取参数（排除文件、敏感信息脱敏）
            paramMap = getParamNameAndValue(joinPoint);
            String argsJson = serializeToJson(paramMap);

            // 统一日志格式：[traceId] 类型 方法 URI IP 参数
            log.info("[{}] API REQUEST | {} {} | IP: {} | Args: {}", traceId, requestMethod, requestUri, ip, argsJson);

            // 执行目标方法
            Object result = joinPoint.proceed();

            // 大对象过滤：序列化结果超过500字符则只打印长度
            String resultJson = serializeToJson(result);
            if (resultJson.length() > 500) {
                resultJson = String.format("【响应数据过长，长度：%d】", resultJson.length());
            }
            log.info("[{}] API RESPONSE | {} {} | Result: {}", traceId, requestMethod, requestUri, resultJson);

            return result;
        } catch (Throwable e) {
            // 异常时打印完整上下文（traceId+参数+IP），便于排查
            log.error("[{}] API EXCEPTION | {} {} | IP: {} | Args: {} | Error: ",
                    traceId, requestMethod, requestUri, ip, serializeToJson(paramMap), e);
            throw e;
        } finally {
            // 打印耗时，无论成功/失败都执行
            long costTime = System.currentTimeMillis() - startTime;
            log.info("[{}] API COST | {} {} | Time: {}ms", traceId, requestMethod, requestUri, costTime);
        }
    }

    /**
     * 优化参数处理：排除文件类型、脱敏敏感参数
     */
    private Map<String, Object> getParamNameAndValue(ProceedingJoinPoint joinPoint) {
        Map<String, Object> paramMap = new HashMap<>();
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String[] paramNames = signature.getParameterNames();
        Object[] paramValues = joinPoint.getArgs();

        if (paramNames == null || paramValues == null) {
            return paramMap;
        }

        for (int i = 0; i < paramNames.length; i++) {
            Object value = paramValues[i];
            // 排除不需要打印的类型
            if (value instanceof HttpServletRequest || value instanceof HttpServletResponse
                    || value instanceof MultipartFile || value instanceof MultipartFile[]) {
                continue;
            }
            // 敏感参数脱敏（密码、手机号、身份证）
            String paramName = paramNames[i];
            Object safeValue = desensitizeValue(paramName, value);
            paramMap.put(paramName, safeValue);
        }
        return paramMap;
    }

    /**
     * 敏感参数脱敏：根据参数名匹配脱敏规则
     */
    private Object desensitizeValue(String paramName, Object value) {
        if (!(value instanceof String strValue)) {
            return value;
        }
        // 匹配敏感参数名（可扩展）
        if (paramName.contains("password") || paramName.contains("pwd")) {
            return "******";
        } else if (paramName.contains("phone") || paramName.contains("mobile")) {
            // 手机号脱敏：138****1234
            return strValue.replaceAll("(\\d{3})\\d{4}(\\d{4})", "$1****$2");
        } else if (paramName.contains("idCard") || paramName.contains("idNo")) {
            // 身份证脱敏：110**********1234
            return strValue.replaceAll("(\\d{6})\\d{8}(\\d{4})", "$1********$2");
        }
        return value;
    }

    /**
     * 安全的JSON序列化：处理异常、兼容各种类型
     */
    private String serializeToJson(Object obj) {
        if (obj == null) {
            return "null";
        }
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            log.warn("[{}] JSON序列化失败 | 类型: {} | 原因: {}",
                    MDC.get("traceId"), obj.getClass().getName(), e.getMessage());
            return obj.toString();
        }
    }

    /**
     * 优化真实IP获取：排除内网IP，取最外层公网IP
     */
    private String getRealIp(HttpServletRequest request) {
        // 优先从X-Forwarded-For获取（反向代理场景）
        String ip = request.getHeader("X-Forwarded-For");
        if (isValidIp(ip)) {
            String[] ipArray = ip.split(",");
            for (String tempIp : ipArray) {
                String trimIp = tempIp.trim();
                // 排除内网IP，取第一个公网IP
                if (isValidIp(trimIp) && !INNER_IP_PATTERN.matcher(trimIp).matches()) {
                    return trimIp;
                }
            }
        }

        // 依次获取其他代理头
        ip = request.getHeader("Proxy-Client-IP");
        if (isValidIp(ip) && !INNER_IP_PATTERN.matcher(ip.trim()).matches()) {
            return ip.trim();
        }

        ip = request.getHeader("WL-Proxy-Client-IP");
        if (isValidIp(ip) && !INNER_IP_PATTERN.matcher(ip.trim()).matches()) {
            return ip.trim();
        }

        // 最后取远程地址，兼容IPv6本地回环
        ip = request.getRemoteAddr();
        return "0:0:0:0:0:0:0:1".equals(ip) ? "127.0.0.1" : ip;
    }

    /**
     * 辅助方法：判断IP是否有效
     */
    private boolean isValidIp(String ip) {
        return ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip.trim());
    }
}