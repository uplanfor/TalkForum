package com.talkforum.talkforumserver.common.anno;

import java.lang.annotation.*;


/**
 * 标记接口不限流
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface NoRateLimit {
}