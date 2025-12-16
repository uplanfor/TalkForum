package com.talkforum.talkforumserver.common.anno;

import java.lang.annotation.*;

/**
 * 自定义限流注解
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface CustomRateLimit {
    /**
     * 滑动窗口时间（ms），默认1000ms
     */
    long window() default 1000;

    /**
     * 窗口内允许的请求次数，默认5次
     */
    int threefold() default 5;
}