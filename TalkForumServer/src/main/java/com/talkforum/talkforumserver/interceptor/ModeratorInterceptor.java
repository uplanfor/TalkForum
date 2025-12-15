package com.talkforum.talkforumserver.interceptor;

import com.talkforum.talkforumserver.common.anno.AdminRequired;
import com.talkforum.talkforumserver.common.exception.BusinessRuntimeException;
import com.talkforum.talkforumserver.common.util.CookieHelper;
import com.talkforum.talkforumserver.common.util.JWTHelper;
import com.talkforum.talkforumserver.common.util.RedisHelper;
import com.talkforum.talkforumserver.constant.ServerConstant;
import com.talkforum.talkforumserver.constant.UserConstant;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Map;

/**
 * 风纪权限拦截器
 * 用于拦截需要版主权限的接口，验证用户是否具有风纪权限
 */
@Component
public class ModeratorInterceptor implements HandlerInterceptor {
    @Autowired
    private JWTHelper jwtHelper; // JWT工具类，用于解析和验证JWT令牌
    @Autowired
    private RedisHelper redisHelper;

    /**
     * 处理请求前的拦截方法
     * @param request HTTP请求对象
     * @param response HTTP响应对象
     * @param handler 处理请求的方法对象
     * @return true表示放行，false表示拦截
     * @throws Exception 处理过程中的异常
     */
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 静态资源直接放行
        if(!(handler instanceof HandlerMethod)){
            return true;
        }
        HandlerMethod handlerMethod = (HandlerMethod) handler;
        AdminRequired adminRequired = handlerMethod.getMethodAnnotation(AdminRequired.class);
        // 不需要管理员权限的接口直接放行
        if(adminRequired == null){
            return true;
        }
        // 验证是否登录
        String value = CookieHelper.getCookieValue(request, ServerConstant.LOGIN_COOKIE);
        if (value == null) {
            // 未登录，返回401状态码和错误信息
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\":401,\"success\":false,\"message\":\"Please Login Required\"}");
            return false;
        } else {
            try {
                // 解析JWT令牌
                Map<String, Object> information = jwtHelper.parseJWTToken(value);
                long userId = ((Number)(information.get("id"))).longValue();
                // 获取用户角色并验证是否为管理员
                String v = (String) information.get("role");
                if (!v.equals(UserConstant.ROLE_ADMIN)) {
                    // 不是管理员，返回403状态码和错误信息
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"code\":403,\"success\":false,\"message\":\"Administrator Permission Required!\"}");
                    return false;
                }
                // 验证令牌是否在Redis中存在
                Object t =  redisHelper.getLoginToken(userId);
                if (t == null) {
                    throw new BusinessRuntimeException("invalid token");
                }
            } catch (JwtException e) {
                // 令牌无效或已过期，返回401
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"code\":401,\"success\":false,\"message\":\"Invalid token, please login again!\"}");
                return false;
            }
        }
        return true;
    }
}
