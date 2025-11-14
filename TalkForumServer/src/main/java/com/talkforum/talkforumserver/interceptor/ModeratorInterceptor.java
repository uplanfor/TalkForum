package com.talkforum.talkforumserver.interceptor;

import com.talkforum.talkforumserver.common.anno.AdminRequired;
import com.talkforum.talkforumserver.common.util.CookieHelper;
import com.talkforum.talkforumserver.common.util.JWTHelper;
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

@Component
public class ModeratorInterceptor implements HandlerInterceptor {
    @Autowired
    private JWTHelper jwtHelper;

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
            response.getWriter().write("{\"code\":401,\"success\":false,\"message\":\"Please Login Required\"}");
            return false;
        } else {
            try {
                Map<String, Object> information = jwtHelper.parseJWTToken(value);
                String v = (String) information.get("role");
                if (!v.equals(UserConstant.ROLE_MODERATOR) && !v.equals(UserConstant.ROLE_ADMIN)) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"code\":401,\"success\":false,\"message\":\"Administrator or Moderator Permission Required!\"}");
                    return false;
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
