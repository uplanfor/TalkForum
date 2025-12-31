package com.talkforum.talkforumserver.interceptor;

import com.talkforum.talkforumserver.common.anno.AdminRequired;
import com.talkforum.talkforumserver.common.anno.ModeratorRequired;
import com.talkforum.talkforumserver.constant.UserConstant;
import com.talkforum.talkforumserver.service.AuthCacheService;
import com.talkforum.talkforumserver.common.anno.LoginRequired;
import com.talkforum.talkforumserver.common.exception.BusinessRuntimeException;
import com.talkforum.talkforumserver.common.util.CookieHelper;
import com.talkforum.talkforumserver.common.util.JWTHelper;
import com.talkforum.talkforumserver.constant.ServerConstant;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Map;


/**
 * 登录验证拦截器
 * 用于拦截需要登录的接口，验证用户是否已登录
 */
@Component
public class LoginInterceptor implements HandlerInterceptor {
    @Autowired
    private JWTHelper jwtHelper; // JWT工具类，用于解析和验证JWT令牌
    @Autowired
    private AuthCacheService authCacheService;

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
        if(!(handler instanceof HandlerMethod handlerMethod)){
            return true;
        }
        LoginRequired loginRequired = handlerMethod.getMethodAnnotation(LoginRequired.class);
        ModeratorRequired moderatorRequired = handlerMethod.getMethodAnnotation(ModeratorRequired.class);
        AdminRequired  adminRequired = handlerMethod.getMethodAnnotation(AdminRequired.class);
        // 没有要求登录接口直接放行
        if(loginRequired == null && moderatorRequired == null && adminRequired == null){
            return true;
        }
        // 验证是否登录
        String value = CookieHelper.getCookieValue(request, ServerConstant.LOGIN_COOKIE);
        if (value == null) {
            // 未登录，返回401状态码和错误信息
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\":401,\"success\":false,\"message\":\"Please sign in so you can use the function!\"}");
            return false;
        } else {
            try {
                // 解析JWT令牌
                Map<String, Object> information = jwtHelper.parseJWTToken(value);
                long userId = ((Number)(information.get("id"))).longValue();
                // 验证令牌是否在Redis中存在（用于单点登录和令牌吊销）
                Object v =  authCacheService.getLoginToken(userId);
                if (v == null || !((String)v).equals(value)) {
                    throw new BusinessRuntimeException("invalid token");
                }

                // 判断根据哪种情况进行拦截
                if (loginRequired != null) {
                    return true;
                }
                else {
                    // 检查高级权限
                    String role = (String) information.get("role");
                    boolean invalid = !role.equals(UserConstant.ROLE_ADMIN) &&
                            (moderatorRequired == null || !role.equals(UserConstant.ROLE_MODERATOR));
                    if (invalid) {
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        response.setContentType("application/json;charset=UTF-8");
                        response.getWriter().write("{\"code\":403,\"success\":false,\"message\":\"Admission Not Allowed!\"}");
                        return false;
                    }
                }
            } catch (RuntimeException e) {
                // 令牌无效或已过期，移除Cookie并返回401
                CookieHelper.removeCookie(response, ServerConstant.LOGIN_COOKIE);
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"code\":401,\"success\":false,\"message\":\"Invalid token, please login again!\"}");
                return false;
            }
        }
        return true;
    }
}
