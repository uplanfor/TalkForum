package com.talkforum.talkforumserver.common.util;

// 替换：去掉 Spring Security 的导入，换成原生 jbcrypt 的包
import org.mindrot.jbcrypt.BCrypt;

public class PasswordHelper {

    // 移除：Spring Security 的 BCryptPasswordEncoder 实例（无需再创建）

    /**
     * 加密密码（功能不变，底层换成原生 jbcrypt）
     * @param rawPassword 原始明文密码
     * @return 加密后的哈希字符串（包含盐值，格式与之前兼容）
     */
    public static String encryptPassword(String rawPassword) {
        // 替换：Spring Security 的 encoder.encode() → 原生 BCrypt.hashpw()
        // BCrypt.gensalt() 自动生成盐值（默认强度 10，与 Spring Security 默认一致）
        return BCrypt.hashpw(rawPassword, BCrypt.gensalt());
    }

    /**
     * 验证密码（功能不变，底层换成原生 jbcrypt）
     * @param rawPassword 输入的明文密码
     * @param encodedPassword 存储的加密后密码
     * @return 验证通过返回true，否则false
     */
    public static boolean verifyPassword(String rawPassword, String encodedPassword) {
        // 替换：Spring Security 的 encoder.matches() → 原生 BCrypt.checkpw()
        return BCrypt.checkpw(rawPassword, encodedPassword);
    }

    // 可选优化：添加加密强度配置（默认 10，与 Spring Security 一致，可按需调整）
    public static String encryptPassword(String rawPassword, int strength) {
        // 强度范围 4-31，推荐 10-12
        return BCrypt.hashpw(rawPassword, BCrypt.gensalt(strength));
    }
}