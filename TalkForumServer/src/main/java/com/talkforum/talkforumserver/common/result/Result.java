package com.talkforum.talkforumserver.common.result;

/**
 * API统一响应结果类
 * 用于封装所有API接口的响应数据，确保返回格式一致
 */
public class Result{
    /**
     * 响应状态码
     */
    public Integer code;
    /**
     * 响应是否成功
     */
    public Boolean success;
    /**
     * 响应消息
     */
    public String message;
    /**
     * 响应数据
     */
    public Object data;
    
    /**
     * 私有构造方法，防止外部直接实例化
     * @param code 状态码
     * @param success 是否成功
     * @param message 响应消息
     * @param data 响应数据
     */
    Result(Integer code, Boolean success, String message, Object data){
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
    public static Result success(Integer code, String message, Object data){
        return new Result(code, true, message, data);
    }

    /**
     * 成功响应 - 带状态码和数据
     * @param code 状态码
     * @param data 响应数据
     * @return Result对象
     */
    public static Result success(Integer code, Object data){
        return new Result(code, true, "success", data);
    }

    /**
     * 成功响应 - 带消息和数据
     * @param message 响应消息
     * @param data 响应数据
     * @return Result对象
     */
    public static Result success(String message, Object data){
        return new Result(200, true, message, data);
    }

    /**
     * 成功响应 - 带消息
     * @param message 响应消息
     * @return Result对象
     */
    public static Result success(String message){
        return new Result(200, true, message, null);
    }

    /**
     * 成功响应 - 无参数
     * @return Result对象
     */
    public static Result success(){
        return new Result(200, true, "success", null);
    }

    /**
     * 错误响应 - 带状态码、消息和数据
     * @param code 状态码
     * @param message 响应消息
     * @param data 响应数据
     * @return Result对象
     */
    public static Result error(Integer code, String message, Object data){
        return new Result(code, false, message, data);
    }

    /**
     * 错误响应 - 带状态码和消息
     * @param code 状态码
     * @param message 响应消息
     * @return Result对象
     */
    public static Result error(Integer code, String message){
        return new Result(code, false, message, null);
    }

    /**
     * 错误响应 - 带消息
     * @param message 响应消息
     * @return Result对象
     */
    public static Result error(String message){
        return new Result(400, false, message, null);
    }

    /**
     * 错误响应 - 带消息和数据
     * @param message 响应消息
     * @param data 响应数据
     * @return Result对象
     */
    public static Result error(String message, Object data){
        return new Result(400, false, message, data);
    }

    /**
     * 错误响应 - 无参数
     * @return Result对象
     */
    public static Result error(){
        return new Result(400, false, "error", null);
    }
}