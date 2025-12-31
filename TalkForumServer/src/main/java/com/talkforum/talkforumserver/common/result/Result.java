package com.talkforum.talkforumserver.common.result;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * API统一响应结果类
 * 用于封装所有API接口的响应数据，确保返回格式一致
 */
@Schema(
        name = "Result",
        description = "API统一响应结果封装类"
)
public class Result<T>{
    /**
     * 响应状态码
     */
    @Schema(
            description = "响应状态码",
            example = "200",
            requiredMode = Schema.RequiredMode.REQUIRED,
            allowableValues = {"200", "400", "401", "403", "500"}
    )
    public Integer code;
    /**
     * 响应是否成功
     */
    @Schema(
            description = "响应成功判断依据",
            example = "true",
            requiredMode = Schema.RequiredMode.REQUIRED,
            allowableValues = {"true", "false"}
    )
    public Boolean success;
    /**
     * 响应消息
     */
    @Schema(
            description = "响应人类可读信息，根据前端的请求自动返回正确的翻译文本",
            example = "Too Many Requests!",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    public String message;

    /**
     * 响应数据
     */
    @Schema(
            description = "响应业务数据（泛型类型）",
            nullable = true // 允许为null（无数据时返回null）
    )
    public T data;
    
    /**
     * 私有构造方法，防止外部直接实例化
     * @param code 状态码
     * @param success 是否成功
     * @param message 响应消息
     * @param data 响应数据
     */
    Result(Integer code, Boolean success, String message, T data){
        this.code = code;
        this.success = success;
        this.message = message;
        this.data = data;
    }
    
    /**
     * 成功响应 - 带状态码、消息和数据
     * @param code 状态码
     * @param message 响应消息
     * @param data 响应数据
     * @return Result对象
     */
    public static <E> Result<E> success(Integer code, String message, E data){
        return new Result<>(code, true, message, data);
    }

    /**
     * 成功响应 - 带状态码和数据
     * @param code 状态码
     * @param data 响应数据
     * @return Result对象
     */
    public static <E> Result<E> success(Integer code, E data){
        return new Result<>(code, true, "success", data);
    }

    /**
     * 成功响应 - 带消息和数据
     * @param message 响应消息
     * @param data 响应数据
     * @return Result对象
     */
    public static <E> Result<E> success(String message, E data) {
        return new Result<>(200, true, message, data);
    }

    /**
     * 成功响应 - 带消息
     * @param message 响应消息
     * @return Result对象
     */
    public static <E> Result<E> success(String message){
        return new Result<>(200, true, message, null);
    }

    /**
     * 成功响应 - 无参数
     * @return Result对象
     */
    public static <E> Result<E> success(){
        return new Result<>(200, true, "success", null);
    }

    /**
     * 错误响应 - 带状态码、消息和数据
     * @param code 状态码
     * @param message 响应消息
     * @param data 响应数据
     * @return Result对象
     */
    public static <E> Result<E> error(Integer code, String message, E data){
        return new Result<>(code, false, message, data);
    }

    /**
     * 错误响应 - 带状态码和消息
     * @param code 状态码
     * @param message 响应消息
     * @return Result对象
     */
    public static <E> Result<E> error(Integer code, String message){
        return new Result<>(code, false, message, null);
    }

    /**
     * 错误响应 - 带消息
     * @param message 响应消息
     * @return Result对象
     */
    public static <E> Result<E> error(String message){
        return new Result<E>(400, false, message, null);
    }

    /**
     * 错误响应 - 带消息和数据
     * @param message 响应消息
     * @param data 响应数据
     * @return Result对象
     */
    public static <E> Result<E> error(String message, E data){
        return new Result<>(400, false, message, data);
    }

    /**
     * 错误响应 - 无参数
     * @return Result对象
     */
    public static <E> Result<E> error(){
        return new Result<E>(400, false, "error", null);
    }
}