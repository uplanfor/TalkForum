package com.talkforum.talkforumserver.interceptor;

import com.talkforum.talkforumserver.common.anno.AdminRequired;
import com.talkforum.talkforumserver.common.exception.BusinessRuntimeException;
import com.talkforum.talkforumserver.common.util.CookieHelper;
import com.talkforum.talkforumserver.common.util.JWTHelper;
import com.talkforum.talkforumserver.constant.RedisKeyConstant;
import com.talkforum.talkforumserver.constant.UserConstant;
import com.talkforum.talkforumserver.constant.ServerConstant;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Map;

@Component
public class AdministratorInterceptor implements HandlerInterceptor {
    @Autowired
    private JWTHelper jwtHelper;
    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 静态资源直接放行
        if(!(handler instanceof HandlerMethod)){
            return true;
        }
        HandlerMethod handlerMethod = (HandlerMethod) handler;
        AdminRequired adminRequired = handlerMethod.getMethodAnnotation(AdminRequired.class);
        // 没有要求登录接口直接放行
        if(adminRequired == null){
            return true;
        }
        // 验证是否登录
        String value = CookieHelper.getCookieValue(request, ServerConstant.LOGIN_COOKIE);
        if (value == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\":401,\"success\":false,\"message\":\"Please sign in so you can use the function!\"}");
            return false;
        } else {
            try {
                Map<String, Object> information = jwtHelper.parseJWTToken(value);
                long userId = ((Number)(information.get("id"))).longValue();
                String v = (String) information.get("role");
                if (!v.equals(UserConstant.ROLE_ADMIN)) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"code\":401,\"success\":false,\"message\":\"Administrator Permission Required!\"}");
                    return false;
                }
                Object t =  stringRedisTemplate.opsForValue().get(RedisKeyConstant.TOKEN_USER + userId);
                if (t == null) {
                    throw new BusinessRuntimeException("invalid token");
                }
            } catch (JwtException e) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"code\":401,\"success\":false,\"message\":\"Invalid token, please login again!\"}");
                return false;
            }
        }
        return true;
    }
}
