package com.talkforum.talkforumserver.common.aspect;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

/**
 * Controller调用日志切面：记录IP、用时、入参（参数名+值）、出参（JSON序列化）
 */
@Slf4j
@Aspect
@Component
public class WebLogAspect {

    // JSON序列化工具（统一配置）
    private final ObjectMapper objectMapper;

    // 初始化ObjectMapper，避免序列化异常
    public WebLogAspect() {
        this.objectMapper = new ObjectMapper();
        // 忽略空bean序列化报错
        objectMapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
        // 忽略未知字段反序列化报错
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        // 日期格式化
        objectMapper.setDateFormat(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"));
    }

    /**
     * 切入点：匹配所有Controller类的方法
     */
    @Pointcut("execution(* com.talkforum.talkforumserver.*.*Controller.*(..))")
    public void controllerPointCut() {}

    /**
     * 环绕通知：核心日志记录逻辑
     */
    @Around("controllerPointCut()")
    public Object logControllerCall(ProceedingJoinPoint joinPoint) throws Throwable {
        // 1. 方法执行前：获取基础信息
        long startTime = System.currentTimeMillis();
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = Objects.requireNonNull(attributes).getRequest();
        String ip = getRealIp(request);

        // 核心：获取参数名+参数值的Map，并序列化为JSON
        Map<String, Object> paramMap = getParamNameAndValue(joinPoint);
        String argsJson = serializeToJson(paramMap);

        // 打印请求基础信息（保留原英文字段）
        log.info("===== Api Calling Start =====");
        log.info("Request {} {} Called by {} Args{}", request.getMethod(), request.getRequestURI(), ip, argsJson);

        Object result = null;
        String resultJson = "null";
        try {
            // 2. 执行目标方法
            result = joinPoint.proceed();

            // 3. 序列化返回结果
            resultJson = serializeToJson(result);
            log.info("call {} {} output：{}",
                    request.getMethod(),
                    request.getRequestURI(), resultJson); // 出参：JSON格式
        } catch (Throwable e) {
            // 4. 异常处理
            log.error("exception happened when call {} {}!：", request.getMethod(),
                    request.getRequestURI(), e);
            throw e;
        } finally {
            // 5. 打印耗时
            long costTime = System.currentTimeMillis() - startTime;
            log.info("cost time：{}ms when calling {} {}", costTime,
                    request.getMethod(), request.getRequestURI());
            log.info("===== Api Calling End =====\n");
        }

        return result;
    }

    /**
     * 获取方法参数名和对应值的Map
     */
    private Map<String, Object> getParamNameAndValue(ProceedingJoinPoint joinPoint) {
        Map<String, Object> paramMap = new HashMap<String, Object>();
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String[] paramNames = signature.getParameterNames(); // 获取参数形参名
        Object[] paramValues = joinPoint.getArgs(); // 获取参数值

        // 组装：参数名=类型_索引，参数值=实际值
        for (int i = 0; i < paramNames.length; i++) {
            Object value = (i < paramValues.length) ? paramValues[i] : null;
            if (!(value instanceof HttpServletRequest) && !(value instanceof jakarta.servlet.http.HttpServletResponse)) {
                String paramName = paramNames[i];
                paramMap.put(paramName, value);
            }
        }
        return paramMap;
    }

    /**
     * 对象序列化为JSON（处理序列化异常）
     */
    private String serializeToJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            log.warn("JSON serialize fail! object type: {}, error: {}",
                    obj != null ? obj.getClass().getName() : "null", e.getMessage());
            return obj != null ? obj.toString() : "null";
        }
    }

    /**
     * 获取真实IP（保留原逻辑）
     */
    private String getRealIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (isValidIp(ip)) {
            String[] ipArray = ip.split(",");
            for (String tempIp : ipArray) {
                String trimIp = tempIp.trim();
                if (isValidIp(trimIp)) {
                    ip = trimIp;
                    break;
                }
            }
            return ip;
        }

        ip = request.getHeader("Proxy-Client-IP");
        if (isValidIp(ip)) {
            return ip.trim();
        }

        ip = request.getHeader("WL-Proxy-Client-IP");
        if (isValidIp(ip)) {
            return ip.trim();
        }

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