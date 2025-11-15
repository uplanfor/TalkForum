package com.talkforum.talkforumserver.constant;

public class ServerConstant {
    public static final String LOGIN_COOKIE = "token";

    /**
     * 密码规则：
     * 1. 长度 8-20 位
     * 2. 必须包含：大写字母、小写字母、数字、至少1种特殊字符
     * 3. 允许的特殊字符：!@#$%^&*()_-+=[]{}|;:,.?~`
     */
    public static final String USER_PASSWORD_RULE = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_\\-+=[\\]{}|;:,.?~`])[a-zA-Z\\d!@#$%^&*()_\\-+=[\\]{}|;:,.?~`]{8,20}$";

    public static final String PASSWORD_RULE_WARNING = "Password must be 8-20 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*()_-+=[]{}|;:,.?~`). Spaces are not allowed.";

    public static final String DEFAULT_PASSWORD = "Qu123456!";
}