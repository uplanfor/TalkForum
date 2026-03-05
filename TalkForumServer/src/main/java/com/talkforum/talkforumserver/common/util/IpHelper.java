package com.talkforum.talkforumserver.common.util;

import jakarta.servlet.http.HttpServletRequest;

public class IpHelper {
    public static String getRealIp(HttpServletRequest request) {
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
