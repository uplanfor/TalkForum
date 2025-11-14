package com.talkforum.talkforumserver;

import com.talkforum.talkforumserver.common.util.JWTHelper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.HashMap;
import java.util.Map;

@SpringBootTest
class TalkForumServerApplicationTests {
    @Autowired
    JWTHelper jwtHelper;

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

}
