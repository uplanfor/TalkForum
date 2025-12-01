package com.talkforum.talkforumserver.common.util;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.Map;

/**
 * JWT工具类
 * 用于生成和解析JWT令牌，提供了多种重载方法以支持不同场景
 */
@Component
public class JWTHelper {
    @Value("${jwt.secret-key}")
    private String secret_key; // JWT签名密钥，从配置文件读取
    @Value("${jwt.expire}")
    private int expire; // JWT过期时间，从配置文件读取，单位毫秒

    /**
     * 生成JWT令牌
     * @param claims 令牌中的自定义声明
     * @param duration 过期时间，单位毫秒
     * @param secret 签名密钥
     * @return 生成的JWT令牌字符串
     */
    public String generateJWTToken(Map<String, Object> claims, int duration, String secret) {
        return Jwts.builder().signWith(SignatureAlgorithm.HS256, secret)
                .addClaims(claims)
                .setExpiration(new Date(System.currentTimeMillis() + duration))
                .compact();
    }

    /**
     * 生成JWT令牌（使用默认密钥）
     * @param claims 令牌中的自定义声明
     * @param duration 过期时间，单位毫秒
     * @return 生成的JWT令牌字符串
     */
    public String generateJWTToken(Map<String, Object> claims, int duration) {
        return generateJWTToken(claims, duration, secret_key);
    }

    /**
     * 生成JWT令牌（使用默认密钥和过期时间）
     * @param claims 令牌中的自定义声明
     * @return 生成的JWT令牌字符串
     */
    public String generateJWTToken(Map<String, Object> claims) {
        return generateJWTToken(claims, expire, secret_key);
    }

    /**
     * 解析JWT令牌
     * @param jwt JWT令牌字符串
     * @param secret 签名密钥
     * @return 令牌中的声明Map
     */
    public Map<String, Object> parseJWTToken(String jwt, String secret) {
        return Jwts.parser().setSigningKey(secret).parseClaimsJws(jwt).getBody();
    }

    /**
     * 解析JWT令牌（使用默认密钥）
     * @param jwt JWT令牌字符串
     * @return 令牌中的声明Map
     * @throws JwtException JWT解析异常
     */
    public Map<String, Object> parseJWTToken(String jwt) throws JwtException {
        return parseJWTToken(jwt, secret_key);
    }

    /**
     * 获取JWT默认过期时间
     * @return 过期时间，单位毫秒
     */
    public int getExpire() {
        return expire;
    }
}
