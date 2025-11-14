package com.talkforum.talkforumserver.common.util;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.Map;

@Component
public class JWTHelper {
    @Value("${jwt.secret-key}")
    private String secret_key;
    @Value("${jwt.expire}")
    private int expire;

    public String generateJWTToken(Map<String, Object> claims, int duration, String secret) {
        return Jwts.builder().signWith(SignatureAlgorithm.HS256, secret)
                .addClaims(claims)
                .setExpiration(new Date(System.currentTimeMillis() + duration))
                .compact();
    }

    public String generateJWTToken(Map<String, Object> claims, int duration) {
        return generateJWTToken(claims, duration, secret_key);
    }

    public String generateJWTToken(Map<String, Object> claims) {
        return generateJWTToken(claims, expire, secret_key);
    }

    public Map<String, Object> parseJWTToken(String jwt, String secret) {
        return Jwts.parser().setSigningKey(secret).parseClaimsJws(jwt).getBody();
    }

    public Map<String, Object> parseJWTToken(String jwt) throws JwtException {
        return parseJWTToken(jwt, secret_key);
    }
}
