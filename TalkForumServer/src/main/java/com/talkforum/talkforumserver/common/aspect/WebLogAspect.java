package com.talkforum.talkforumserver.common.aspect;
import com.talkforum.talkforumserver.common.util.JacksonHelper;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Slf4j
@Aspect
@Component
public class WebLogAspect {
    @Pointcut("execution(* com.talkforum.talkforumserver.*.*Controller.*(..))")
    public void controllerPointCut() {}

    @Around("controllerPointCut()")
    public Object logControllerCall(ProceedingJoinPoint joinPoint) throws Throwable {
        // 请求前打印参数，并移除敏感字段
        String method =  joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();
        
        
        log.info("[REQUEST START]{} ARGS {} ", method, Arrays.toString(args));
        
        // 执行请求，计算耗时
        Object result = null;
        long beginTime = System.currentTimeMillis();
        try {
            result = joinPoint.proceed(args);
            log.info("[REQUEST RESPONSE]{} response{}", method, JacksonHelper.toJson(result));
        } catch (Exception e) {
            log.error("[REQUEST ERROR]{} ", method, e);
            throw e;
        } finally{
            long costTime = System.currentTimeMillis() - beginTime;
            log.info("[REQUEST END]{} cost {} ms", method, costTime);
        }
        return result;
    }
    
    private String filterFiledArgsToString(Object[] args) {
        if (args == null || args.length == 0) {
            return "";
        }
        Object[] temp = Arrays.copyOf(args, args.length);
        return Arrays.toString(temp);
    }
}