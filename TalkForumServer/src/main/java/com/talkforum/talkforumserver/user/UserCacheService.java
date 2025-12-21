package com.talkforum.talkforumserver.user;

import com.talkforum.talkforumserver.common.exception.BusinessRuntimeException;
import com.talkforum.talkforumserver.common.util.I18n;
import com.talkforum.talkforumserver.common.util.JacksonHelper;
import com.talkforum.talkforumserver.common.util.RedisHelper;
import com.talkforum.talkforumserver.common.vo.UserVO;
import com.talkforum.talkforumserver.constant.RedisConstant;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

/**
 * 用户缓存服务类
 * 负责用户数据的缓存管理，包括缓存读取、更新、删除等操作
 * 提供缓存击穿、雪崩、穿透防护机制
 * 
 * 设计原则：
 * 1. 缓存未命中时，使用分布式锁防止缓存击穿
 * 2. 对空值进行缓存，防止缓存穿透
 * 3. 使用随机过期时间，防止缓存雪崩
 * 4. 更新操作仅当缓存存在时进行，避免不必要的缓存设置
 */
@Slf4j
@Component
public class UserCacheService {
    @Autowired
    private RedisHelper redisHelper;
    @Autowired
    private UserMapper userMapper;

    /**
     * 根据用户ID获取用户VO对象（带缓存）
     * 实现缓存读取逻辑：优先从缓存获取，缓存不存在时从数据库获取并添加到缓存
     * 
     * @param userId 用户ID
     * @return 用户VO对象，如果用户不存在返回null
     * @throws BusinessRuntimeException 当用户不存在时抛出异常（与原有业务逻辑保持一致）
     */
    public UserVO getUserVO(Long userId) {
        // 1.检查参数
        if (userId == null) {
            log.error("【getUserVO-缓存路径-参数错误】userId为空，无法查询缓存");
            throw new BusinessRuntimeException(I18n.t("common.invalid-params"));
        }
        
        log.debug("【getUserVO-缓存路径-开始】开始获取用户缓存，userId: {}", userId);
        
        // 2.查缓存
        String cacheKey = RedisConstant.USER_CACHE_PREFIX + userId;
        log.debug("【getUserVO-缓存路径-缓存键】生成的缓存键: {}", cacheKey);
        
        String cacheValue = (String)redisHelper.stringGet(cacheKey);
        
        if (cacheValue != null) {
            log.debug("【getUserVO-缓存路径-缓存命中】缓存命中，userId: {}", userId);
            
            // 空值缓存（防止缓存穿透）
            if (RedisConstant.USER_HIT_NONE.equals(cacheValue)) {
                log.warn("【getUserVO-缓存路径-空值缓存】命中空值缓存，userId: {} 不存在", userId);
                throw new BusinessRuntimeException(I18n.t("user.not.found"));
            }
            
            log.debug("【getUserVO-缓存路径-缓存返回】从缓存返回数据，userId: {}", userId);
            return JacksonHelper.fromJson(cacheValue, UserVO.class);
        }
        
        log.debug("【getUserVO-缓存路径-缓存未命中】缓存未命中，需要查询数据库，userId: {}", userId);

        // 3. 缓存未命中，加分布式锁查询数据库（解决缓存击穿）
        boolean locked = false;
        String lockKey = RedisConstant.USER_CACHE_LOCK_PREFIX + userId;
        String lockValue = String.valueOf(Thread.currentThread().getId()); // 锁的值=当前线程ID
        
        log.debug("【getUserVO-缓存路径-分布式锁】尝试获取分布式锁，lockKey: {}, threadId: {}", lockKey, lockValue);
        
        try {
            // 尝试获取分布式锁（调用新增的tryLock方法）
            locked = redisHelper.tryLock(lockKey, lockValue, RedisConstant.LOCK_EXPIRE_SEC);
            
            if (locked) {
                log.debug("【getUserVO-缓存路径-获取锁成功】成功获取分布式锁，lockKey: {}", lockKey);
                
                // 双重检查缓存（避免锁释放后重复查询）
                cacheValue = (String)redisHelper.stringGet(cacheKey);
                if (cacheValue != null) {
                    log.debug("【getUserVO-缓存路径-双重检查】双重检查缓存命中，lockKey: {}", lockKey);
                    if (RedisConstant.USER_HIT_NONE.equals(cacheValue)) {
                        throw new BusinessRuntimeException(I18n.t("user.not.found"));
                    }
                    return JacksonHelper.fromJson(cacheValue, UserVO.class);
                }

                log.debug("【getUserVO-缓存路径-查询数据库】缓存未命中，开始查询数据库，userId: {}", userId);
                // 4. 调用数据库查询回调（解耦工具类与业务逻辑）
                UserVO user = userMapper.getUserVOById(userId);

                // 5. 数据库无数据，缓存空值（解决缓存穿透）
                if (user == null) {
                    log.warn("【getUserVO-缓存路径-数据库无数据】数据库中未找到用户，缓存空值，userId: {}", userId);
                    redisHelper.stringSet(cacheKey, RedisConstant.USER_HIT_NONE, RedisConstant.NULL_VALUE_EXPIRE_SEC, TimeUnit.SECONDS);
                    throw new BusinessRuntimeException(I18n.t("user.not.found"));
                }

                // 6. 数据库有数据，缓存（随机过期时间，解决缓存雪崩）
                long expireTime = RedisConstant.USER_BASE_EXPIRE_SEC + (long) (Math.random() * RedisConstant.RANDOM_OFFSET_SEC);
                log.debug("【getUserVO-缓存路径-缓存数据】数据库查询成功，缓存数据，userId: {}, 过期时间: {}秒", userId, expireTime);
                redisHelper.stringSet(cacheKey, JacksonHelper.toJson(user), expireTime, TimeUnit.SECONDS);
                return user;
            } else {
                // 获取锁失败，短暂休眠后重试（避免并发请求直击数据库）
                log.warn("【getUserVO-缓存路径-获取锁失败】获取分布式锁失败，等待50ms后重试，lockKey: {}", lockKey);
                TimeUnit.MILLISECONDS.sleep(50);
                log.debug("【getUserVO-缓存路径-重试】开始重试获取用户数据，userId: {}", userId);
                return getUserVO(userId);
            }
        } catch (InterruptedException e) {
            // 休眠被中断，恢复中断状态
            Thread.currentThread().interrupt();
            log.error("【getUserVO-缓存路径-中断异常】线程被中断，降级直接查询数据库，userId: {}", userId, e);
            // 降级：直接查数据库
            UserVO user = userMapper.getUserVOById(userId);
            if (user == null) {
                throw new BusinessRuntimeException(I18n.t("user.not.found"));
            }
            return user;
        } catch (Exception e) {
            // 不处理
            log.error("【getUserVO-缓存路径-异常】发生异常，userId: {}", userId, e);
            throw e;
        } finally {
            // 释放分布式锁（仅释放当前线程持有的锁）
            if (locked) {
                log.debug("【getUserVO-缓存路径-释放锁】释放分布式锁，lockKey: {}", lockKey);
                redisHelper.unlock(lockKey, lockValue);
            } else {
                log.debug("【getUserVO-缓存路径-无需释放锁】未获取到锁，无需释放，lockKey: {}", lockKey);
            }
        }
    }

    /**
     * 更新用户缓存（仅当缓存存在时更新）
     * 用于用户资料、角色、状态更新后的缓存同步
     * 
     * @param userId 用户ID
     * @return 更新后的用户VO对象，如果缓存不存在返回null
     */
    public UserVO updateUserCache(Long userId) {
        log.info("【updateUserCache-缓存路径】开始更新用户缓存，userId: {}", userId);
        
        if (userId == null) {
            log.error("【updateUserCache-缓存路径-参数错误】userId为空，无法更新缓存");
            return null;
        }
        
        String cacheKey = RedisConstant.USER_CACHE_PREFIX + userId;
        
        try {
            // 1. 检查缓存是否存在
            String cachedValue = (String)redisHelper.stringGet(cacheKey);
            if (cachedValue == null || RedisConstant.USER_HIT_NONE.equals(cachedValue)) {
                log.info("【updateUserCache-缓存路径-缓存不存在】缓存中不存在用户数据，跳过更新，userId: {}", userId);
                return null;
            }
            
            // 2. 查询最新的用户数据
            log.debug("【updateUserCache-缓存路径-查询数据库】缓存存在，查询最新用户数据，userId: {}", userId);
            UserVO updatedUser = userMapper.getUserVOById(userId);
            if (updatedUser == null) {
                log.warn("【updateUserCache-缓存路径-数据不存在】数据库中未找到用户，userId: {}", userId);
                // 如果用户不存在，删除缓存中的空值标记
                redisHelper.stringDelete(cacheKey);
                return null;
            }
            
            // 3. 更新缓存，使用新的过期时间（随机过期时间，解决缓存雪崩）
            long expireTime = RedisConstant.USER_BASE_EXPIRE_SEC + (long) (Math.random() * RedisConstant.RANDOM_OFFSET_SEC);
            redisHelper.stringSet(cacheKey, JacksonHelper.toJson(updatedUser), expireTime, TimeUnit.SECONDS);
            
            log.info("【updateUserCache-缓存路径-缓存更新成功】用户缓存已更新，userId: {}, 过期时间: {}秒", userId, expireTime);
            return updatedUser;
            
        } catch (Exception e) {
            log.error("【updateUserCache-缓存路径-异常】更新用户缓存失败，userId: {}", userId, e);
            return null;
        }
    }

}