package com.talkforum.talkforumserver.constant;

/**
 * 服务器相关常量类
 * 定义了服务器配置、Cookie名称、密码规则等常量
 */
public class ServerConstant {
    public static final String LOGIN_COOKIE = "token"; // 登录Cookie的名称，用于存储JWT令牌

    /**
     * 密码规则：
     * 1. 长度 8-32 位
     * 2. 允许的字符：字母、数字、空格和多种特殊字符
     * 3. 允许的特殊字符：!"#$%&'()*+,-./:;<=>?@\\[\\]^_`{|}~
     */
    public static final String USER_PASSWORD_RULE = "^[a-zA-Z0-9 !\\\"#$%&'()*+,-./:;<=>?@\\\\[\\\\]^_`{|}~]{8,32}$"; // 用户密码正则表达式规则
    public static final String DEFAULT_PASSWORD = "Qu123456!"; // 默认密码，用于初始化用户或重置密码
}