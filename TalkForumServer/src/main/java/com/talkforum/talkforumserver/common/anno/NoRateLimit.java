package com.talkforum.talkforumserver.common.anno;

import java.lang.annotation.*;

@Target({ElementType.METHOD, ElementType.TYPE}) // 可标记方法/类（类下所有方法生效）
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface NoRateLimit {
}