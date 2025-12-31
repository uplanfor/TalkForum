package com.talkforum.talkforumserver.common.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Cookie 操作工具类
 * 提供 Cookie 读取、写入、删除等常用方法（支持 HttpOnly、Secure、SameSite 等安全配置）
 */
public class CookieHelper {

    // 私有构造方法：工具类禁止实例化
    private CookieHelper() {
        throw new AssertionError("工具类不能实例化");
    }

    // ==================== 读取 Cookie（原有方法，优化编码处理）====================
    /**
     * 根据 Cookie 名称读取 Cookie 值（自动 URL 解码，兼容特殊字符）
     *
     * @param request    HTTP 请求对象（不可为 null）
     * @param cookieName 要读取的 Cookie 名称（不可为 null/空）
     * @return 解码后的 Cookie 值；未找到/参数非法返回 null
     */
    public static String getCookieValue(HttpServletRequest request, String cookieName) {
        // 参数判空
        if (request == null || cookieName == null || cookieName.trim().isEmpty()) {
            return null;
        }

        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }

        // 遍历匹配 Cookie 名称，解码值（处理特殊字符）
        for (Cookie cookie : cookies) {
            if (cookieName.equals(cookie.getName())) {
                // URL 解码：对应写入时的编码，避免特殊字符（如空格、&、=）失效
                return java.net.URLDecoder.decode(cookie.getValue(), StandardCharsets.UTF_8);
            }
        }
        return null;
    }

    // ==================== 写入 Cookie（新增核心方法）====================
    /**
     * 基础写入 Cookie（默认配置：HttpOnly=true、路径="/"、会话级有效期、SameSite=Lax）
     * 适合登录 token 等需要安全防护的场景
     *
     * @param response   HTTP 响应对象（不可为 null）
     * @param cookieName Cookie 名称（不可为 null/空）
     * @param cookieValue Cookie 值（不可为 null，特殊字符自动 URL 编码）
     */
    public static void setCookie(HttpServletResponse response, String cookieName, String cookieValue) {
        // 调用全参数方法，使用默认安全配置
        setCookie(
                response,
                cookieName,
                cookieValue,
                -1, // 有效期：-1 = 会话级（关闭浏览器失效），正数=秒数，0=删除
                "/", // 路径："/" 表示所有接口可访问
                true, // HttpOnly：默认开启（防 XSS）
                false, // Secure：默认关闭（开发环境），生产环境建议设为 true（HTTPS 下）
                "Lax" // SameSite：默认 Lax（防 CSRF）
        );
    }

    public static void setCookie(HttpServletResponse response, String cookieName, String cookieValue, int maxAge) {
        setCookie(response, cookieName, cookieValue, maxAge, "/", true, false, "Lax");
    }

    /**
     * 自定义配置写入 Cookie（支持全属性配置，灵活适配各种场景）
     *
     * @param response     HTTP 响应对象（不可为 null）
     * @param cookieName   Cookie 名称（不可为 null/空）
     * @param cookieValue  Cookie 值（不可为 null，特殊字符自动 URL 编码）
     * @param maxAge       有效期（秒）：-1=会话级，正数=存活秒数，0=立即删除
     * @param path         访问路径："/"=所有路径，"/user"=仅/user下接口可访问
     * @param isHttpOnly   是否开启 HttpOnly（true=防 XSS，建议登录相关 Cookie 开启）
     * @param isSecure     是否开启 Secure（true=仅 HTTPS 传输，生产环境建议开启）
     * @param sameSite     SameSite 策略：Lax（默认）、Strict、None（需配合 Secure=true）
     */
    public static void setCookie(
            HttpServletResponse response,
            String cookieName,
            String cookieValue,
            int maxAge,
            String path,
            boolean isHttpOnly,
            boolean isSecure,
            String sameSite
    ) {
        // 1. 强制参数校验（避免无效配置）
        if (response == null) {
            throw new IllegalArgumentException("HttpServletResponse 不能为 null");
        }
        if (cookieName == null || cookieName.trim().isEmpty()) {
            throw new IllegalArgumentException("Cookie 名称不能为 null 或空字符串");
        }
        if (cookieValue == null) {
            throw new IllegalArgumentException("Cookie 值不能为 null");
        }

        try {
            // 2. 编码 Cookie 名称和值（避免特殊字符）
            String encodedName = URLEncoder.encode(cookieName, "UTF-8");
            String encodedValue = URLEncoder.encode(cookieValue, "UTF-8");

            // 3. 拼接 Cookie 核心部分（name=value; Max-Age=xxx; Path=xxx; ...）
            StringBuilder cookieHeader = new StringBuilder();
            cookieHeader.append(encodedName).append("=").append(encodedValue);

            // 4. 拼接有效期（Max-Age 是秒数，替代旧的 Expires）
            if (maxAge >= 0) {
                cookieHeader.append("; Max-Age=").append(maxAge);
            }

            // 5. 拼接路径（必须和写入时一致，否则前端无法读取）
            if (path != null && !path.isEmpty()) {
                cookieHeader.append("; Path=").append(path);
            }

            // 6. 拼接 Secure（仅 HTTPS 传输）
            if (isSecure) {
                cookieHeader.append("; Secure");
            }

            // 7. 拼接 HttpOnly（防 XSS）
            if (isHttpOnly) {
                cookieHeader.append("; HttpOnly");
            }

            // 8. 拼接 SameSite（核心：手动添加，兼容低版本）
            if (sameSite != null && !sameSite.isEmpty()) {
                cookieHeader.append("; SameSite=").append(sameSite);
            }

            // （可选）拼接域名（跨子域名访问时添加）
            // if (domain != null && !domain.isEmpty()) {
            //     cookieHeader.append("; Domain=").append(domain);
            // }

            // 9. 手动写入响应头（关键：用 addHeader 而非 addCookie，避免原生 API 限制）
            response.addHeader("Set-Cookie", cookieHeader.toString());

        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException("Cookie 编码失败", e);
        }
    }


    // ==================== 快速删除 Cookie（新增辅助方法）====================
    /**
     * 根据名称删除 Cookie（本质是设置有效期为 0）
     *
     * @param response   HTTP 响应对象
     * @param cookieName 要删除的 Cookie 名称
     * @param path       Cookie 对应的路径（需和写入时一致，否则删除失败）
     */
    public static void removeCookie(HttpServletResponse response, String cookieName, String path) {
        // 设置 maxAge=0，触发浏览器删除 Cookie
        setCookie(response, cookieName, "", 0, path, true, false, "Lax");
    }

    public static void removeCookie(HttpServletResponse response, String cookieName) {
        removeCookie(response, cookieName, "/");
    }
}