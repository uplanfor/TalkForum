package com.talkforum.talkforumserver.common.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import com.talkforum.talkforumserver.common.exception.BusinessRuntimeException;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * 用于序列化Java类到JSON字符串
 */
@Slf4j
public class JacksonHelper {
    private JacksonHelper() {}

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

//    //  静态代码块初始化通用配置
//    static {
//        // 基础配置：忽略未知字段、关闭时间戳序列化、允许空值序列化
//        OBJECT_MAPPER.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
//        OBJECT_MAPPER.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
//        OBJECT_MAPPER.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
//
//        // 处理Java 8时间类型（LocalDateTime/LocalDate等）
//        JavaTimeModule timeModule = new JavaTimeModule();
//        DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
//        timeModule.addSerializer(LocalDateTime.class, new LocalDateTimeSerializer(dateTimeFormatter));
//        timeModule.addDeserializer(LocalDateTime.class, new LocalDateTimeDeserializer(dateTimeFormatter));
//        OBJECT_MAPPER.registerModule(timeModule);
//
//        // 处理Long类型序列化（避免前端精度丢失）
//        SimpleModule longModule = new SimpleModule();
//        longModule.addSerializer(Long.class, ToStringSerializer.instance);
//        longModule.addSerializer(Long.TYPE, ToStringSerializer.instance);
//        OBJECT_MAPPER.registerModule(longModule);
//    }

    public static String toJson(Object object) throws JsonProcessingException {
        return OBJECT_MAPPER.writeValueAsString(object);
    }

    public static <T> T fromJson(String json, Class<T> clazz) throws JsonProcessingException {
        return OBJECT_MAPPER.readValue(json, clazz);
    }

}
