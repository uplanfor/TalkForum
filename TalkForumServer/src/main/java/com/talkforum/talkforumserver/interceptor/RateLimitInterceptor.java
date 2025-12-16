package com.talkforum.talkforumserver.interceptor;

import java.util.Collections;
import java.util.List;

import com.talkforum.talkforumserver.common.anno.CustomRateLimit;
import com.talkforum.talkforumserver.common.anno.NoRateLimit;
import com.talkforum.talkforumserver.common.util.I18n;
import com.talkforum.talkforumserver.common.util.RedisHelper;
import io.micrometer.common.util.StringUtils;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.scripting.support.ResourceScriptSource;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;

/**
 * 滑动窗口限流拦截器
 */
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    @Autowired
    private StringRedisTemplate stringRedisTemplate;
    // Lua脚本
    private DefaultRedisScript<Long> rateLimitScript;


    /**
     * 初始化Lua脚本
     */
    @PostConstruct
    public void init() {
        rateLimitScript = new DefaultRedisScript<>();
        rateLimitScript.setScriptSource(new ResourceScriptSource(new ClassPathResource("lua/rate_limit.lua")));
        rateLimitScript.setResultType(Long.class);
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 1. 非Controller方法（如静态资源）直接放行
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }
        HandlerMethod handlerMethod = (HandlerMethod) handler;

        // 2. 判断是否有@NoRateLimit注解，有则放行
        if (handlerMethod.hasMethodAnnotation(NoRateLimit.class)
                || handlerMethod.getBeanType().isAnnotationPresent(NoRateLimit.class)) {
            return true;
        }

        // 3. 获取限流配置（自定义注解 → 默认值）
        CustomRateLimit rateLimit = handlerMethod.getMethodAnnotation(CustomRateLimit.class);
        if (rateLimit == null) {
            rateLimit = handlerMethod.getBeanType().getAnnotation(CustomRateLimit.class);
        }
        long window = rateLimit != null ? rateLimit.window() : 1000;
        int threefold = rateLimit != null ? rateLimit.threefold() : 5;

        // 4. 提取限流ID（核心：可替换为用户ID/IP/接口ID等，这里示例从请求头取user-id）
        String limitId = extractLimitId(request);
        if (StringUtils.isBlank(limitId)) {
            // 无ID时默认拦截（或根据业务调整）
            returnJson(response, "限流ID不能为空");
            return false;
        }
        String redisKey = "rate_limit:" + limitId; // RedisKey前缀

        // 5. 执行Lua脚本
        List<String> keys = Collections.singletonList(redisKey);
        long now = System.currentTimeMillis();
        // 脚本入参：窗口时间、限流次数、当前时间戳
        List<String> args = List.of(String.valueOf(window), String.valueOf(threefold), String.valueOf(now));
        Long result = stringRedisTemplate.execute(rateLimitScript, keys, args.toArray(new String[0]));

        // 6. 判断结果：1=放行，0=限流
        if (result == null || result == 0) {
            returnJson(response, I18n.t("common.tomanyrequest"));
            return false;
        }
        return true;
    }

    /**
     * 提取限流ID（可自定义：比如用户ID、IP、接口路径+用户ID等）
     */
    private String extractLimitId(HttpServletRequest request) {
        // 示例1：从请求头取user-id（推荐，用户维度限流）
//        String userId = request.getHeader("user-id");
//        if (StringUtils.isNotBlank(userId)) {
//            return userId;
//        }
        // 示例2：备用方案 - 取IP（IP维度限流）
         return getIpAddress(request);
        // 示例3：接口维度（接口路径）
        // return request.getRequestURI();
//        return null;
    }

    /**
     * 返回限流提示JSON
     */
    private void returnJson(HttpServletResponse response, String msg) throws IOException {
        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json; charset=utf-8");
        response.getWriter().write("{\"code\":429,\"msg\":\"" + msg + "\"}");
    }

    /**
     * （可选）获取客户端IP
     */
    private String getIpAddress(HttpServletRequest request) {
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