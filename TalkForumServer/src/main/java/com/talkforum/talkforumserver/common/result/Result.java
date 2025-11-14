package com.talkforum.talkforumserver.common.result;

public class Result{
    public Integer code;
    public Boolean success;
    public String message;
    public Object data;
    
    Result(Integer code, Boolean success, String message, Object data){
        this.code = code;
        this.success = success;
        this.message = message;
        this.data = data;
    }
    
    public static Result success(Integer code, String message, Object data){
        return new Result(code, true, message, data);
    }

    public static Result success(Integer code, Object data){
        return new Result(code, true, "success", data);
    }

    public static Result success(String message, Object data){
        return new Result(200, true, message, data);
    }

    public static Result success(Object data){
        return new Result(200, true, "success", data);
    }

    public static Result success(){
        return new Result(200, true, "success", null);
    }

    public static Result error(Integer code, String message, Object data){
        return new Result(code, false, message, data);
    }

    public static Result error(Integer code, String message){
        return new Result(code, false, message, null);
    }


    public static Result error(String message){
        return new Result(400, false, message, null);
    }

    public static Result error(){
        return new Result(400, false, "error", null);
    }
}