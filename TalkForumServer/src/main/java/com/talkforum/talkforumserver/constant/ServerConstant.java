package com.talkforum.talkforumserver.constant;

public class ServerConstant {
    public static final String LOGIN_COOKIE = "token";
    public static final String USER_PASSWORD_RULE = "^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9,_]{8,32}$";
    public static final String PASSWORD_RULE_WARNING = "Password must be 8-32 characters long, consist of letters, numbers, commas or underscores, and contain at least one letter and one number";
    public static final String DEFAULT_PASSWORD = "Qu12345678";
}
