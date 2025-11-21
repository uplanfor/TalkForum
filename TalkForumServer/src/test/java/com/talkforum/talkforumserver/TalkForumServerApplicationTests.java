package com.talkforum.talkforumserver;

import com.talkforum.talkforumserver.common.util.JWTHelper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@SpringBootTest
class TalkForumServerApplicationTests {
    @Autowired
    JWTHelper jwtHelper;
    @Autowired
    RedisTemplate redisTemplate;

    @Test
    void testJWTHelper() {
        Map<String, Object> claims = new HashMap<>();
        String jwt = jwtHelper.generateJWTToken(claims);
        System.out.println(jwt);
        try {
            Map<String, Object> claims2 = jwtHelper.parseJWTToken(jwt);
        }
        catch (Exception e) {
            e.printStackTrace();
            System.out.println("Wrong!");
        }
    }


    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Test
    public void testRedisConnection() {
        // 存值到 Redis
        stringRedisTemplate.opsForValue().set("test:key", "Hello Memurai", 10, TimeUnit.MINUTES);
        // 取值
        stringRedisTemplate.opsForValue().get("test:key");
    }

}
