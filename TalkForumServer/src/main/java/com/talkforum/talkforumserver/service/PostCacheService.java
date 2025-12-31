package com.talkforum.talkforumserver.service;

import com.talkforum.talkforumserver.common.exception.BusinessRuntimeException;
import com.talkforum.talkforumserver.common.util.I18n;
import com.talkforum.talkforumserver.common.util.JacksonHelper;
import com.talkforum.talkforumserver.common.util.RedisHelper;
import com.talkforum.talkforumserver.common.vo.PostVO;
import com.talkforum.talkforumserver.constant.RedisConstant;
import com.talkforum.talkforumserver.mapper.PostMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;


@Slf4j
@Component
public class PostCacheService {
    @Autowired
    private RedisHelper redisHelper;
    @Autowired
    private PostMapper postMapper;

    public PostVO getPostVO(Long postId) {
        // 1.检查参数
        if (postId == null) {
            log.error("【getPost-缓存路径-参数错误】postId为空，无法查询缓存");
            throw new BusinessRuntimeException(I18n.t("common.invalid-params"));
        }
        
        log.debug("【getPost-缓存路径-开始】开始获取帖子缓存，postId: {}", postId);
        
        // 2.查缓存
        String cacheKey = RedisConstant.POST_CACHE_PREFIX + postId;
        log.debug("【getPost-缓存路径-缓存键】生成的缓存键: {}", cacheKey);
        
        String cacheValue = (String)redisHelper.stringGet(cacheKey);
        
        if (cacheValue != null) {
            log.debug("【getPost-缓存路径-缓存命中】缓存命中，postId: {}", postId);
            
            // 空值缓存
            if (RedisConstant.POST_HIT_NONE.equals(cacheValue)) {
                log.warn("【getPost-缓存路径-空值缓存】命中空值缓存，postId: {} 不存在", postId);
                throw new BusinessRuntimeException(I18n.t("post.not.exist"));
            }
            
            log.debug("【getPost-缓存路径-缓存返回】从缓存返回数据，postId: {}", postId);
            return JacksonHelper.fromJson(cacheValue, PostVO.class);
        }
        
        log.debug("【getPost-缓存路径-缓存未命中】缓存未命中，需要查询数据库，postId: {}", postId);

        // 4. 缓存未命中，加分布式锁查询数据库（解决击穿）
        boolean locked = false;
        String lockKey = RedisConstant.POST_CACHE_LOCK_PREFIX + postId;
        String lockValue = String.valueOf(Thread.currentThread().getId()); // 锁的值=当前线程ID
        
        log.debug("【getPost-缓存路径-分布式锁】尝试获取分布式锁，lockKey: {}, threadId: {}", lockKey, lockValue);
        
        try {
            // 尝试获取分布式锁（调用新增的tryLock方法）
            locked = redisHelper.tryLock(lockKey, lockValue, RedisConstant.LOCK_EXPIRE_SEC);
            
            if (locked) {
                log.debug("【getPost-缓存路径-获取锁成功】成功获取分布式锁，lockKey: {}", lockKey);
                
                // 双重检查缓存（避免锁释放后重复查询）
                cacheValue = (String)redisHelper.stringGet(cacheKey);
                if (cacheValue != null) {
                    log.debug("【getPost-缓存路径-双重检查】双重检查缓存命中，lockKey: {}", lockKey);
                    return JacksonHelper.fromJson(cacheValue, PostVO.class);
                }

                log.debug("【getPost-缓存路径-查询数据库】缓存未命中，开始查询数据库，postId: {}", postId);
                // 5. 调用数据库查询回调（解耦工具类与业务逻辑）
                PostVO post = postMapper.getPostVO(postId);

                // 6. 数据库无数据，缓存空值（解决穿透）
                if (post == null) {
                    log.warn("【getPost-缓存路径-数据库无数据】数据库中未找到帖子，缓存空值，postId: {}", postId);
                    redisHelper.stringSet(cacheKey, RedisConstant.POST_HIT_NONE, RedisConstant.NULL_VALUE_EXPIRE_SEC, TimeUnit.SECONDS);
                    throw new BusinessRuntimeException(I18n.t("post.not.exist"));
                }

                // 7. 数据库有数据，缓存（随机过期时间，解决雪崩）
                long expireTime = RedisConstant.POST_BASE_EXPIRE_SEC + (long) (Math.random() * RedisConstant.RANDOM_OFFSET_SEC);
                log.debug("【getPost-缓存路径-缓存数据】数据库查询成功，缓存数据，postId: {}, 过期时间: {}秒", postId, expireTime);
                redisHelper.stringSet(cacheKey, JacksonHelper.toJson(post), expireTime, TimeUnit.SECONDS);
                return post;
            } else {
                // 获取锁失败，短暂休眠后重试（避免并发请求直击数据库）
                log.warn("【getPost-缓存路径-获取锁失败】获取分布式锁失败，等待50ms后重试，lockKey: {}", lockKey);
                TimeUnit.MILLISECONDS.sleep(50);
                log.debug("【getPost-缓存路径-重试】开始重试获取帖子数据，postId: {}", postId);
                return getPostVO(postId);
            }
        } catch (InterruptedException e) {
            // 休眠被中断，恢复中断状态
            Thread.currentThread().interrupt();
            log.error("【getPost-缓存路径-中断异常】线程被中断，降级直接查询数据库，postId: {}", postId, e);
            // 降级：直接查数据库
            return postMapper.getPostVO(postId);
        } catch (Exception e) {
            // 不处理
            log.error("【getPost-缓存路径-异常】发生异常，postId: {}", postId, e);
            throw e;
        } finally {
            // 释放分布式锁（仅释放当前线程持有的锁）
            if (locked) {
                log.debug("【getPost-缓存路径-释放锁】释放分布式锁，lockKey: {}", lockKey);
                redisHelper.unlock(lockKey, lockValue);
            } else {
                log.debug("【getPost-缓存路径-无需释放锁】未获取到锁，无需释放，lockKey: {}", lockKey);
            }
        }
    }

    /**
     * 更新帖子缓存
     * 当帖子内容被编辑时，更新缓存中的数据
     * @param postId 帖子ID
     * @return 更新后的帖子VO对象
     */
    public PostVO editPost(Long postId) {
        log.info("【editPost-缓存路径】开始更新帖子缓存，postId: {}", postId);
        
        if (postId == null) {
            log.error("【editPost-缓存路径-参数错误】postId为空，无法更新缓存");
            return null;
        }
        
        String cacheKey = RedisConstant.POST_CACHE_PREFIX + postId;
        
        try {
            // 查询最新的帖子数据
            PostVO updatedPost = postMapper.getPostVO(postId);
            
            if (updatedPost == null) {
                log.warn("【editPost-缓存路径-数据不存在】数据库中未找到帖子，postId: {}", postId);
                // 如果帖子不存在，删除缓存中的空值标记
                redisHelper.stringDelete(cacheKey);
                return null;
            }
            
            // 更新缓存，使用新的过期时间
            long expireTime = RedisConstant.POST_BASE_EXPIRE_SEC + (long) (Math.random() * RedisConstant.RANDOM_OFFSET_SEC);
            redisHelper.stringSet(cacheKey, JacksonHelper.toJson(updatedPost), expireTime, TimeUnit.SECONDS);
            
            log.info("【editPost-缓存路径-缓存更新成功】帖子缓存已更新，postId: {}, 过期时间: {}秒", postId, expireTime);
            return updatedPost;
            
        } catch (Exception e) {
            log.error("【editPost-缓存路径-异常】更新帖子缓存失败，postId: {}", postId, e);
            return null;
        }
    }
    
    /**
     * 删除帖子缓存
     * 当帖子被删除或状态变更为DELETED时，清除缓存
     * @param postId 帖子ID
     */
    public void evictCache(Long postId) {
        log.info("【evictCache-缓存路径】开始删除帖子缓存，postId: {}", postId);
        
        if (postId == null) {
            log.error("【缓存路径-参数错误】postId为空，无法删除缓存");
            return;
        }
        
        String cacheKey = RedisConstant.POST_CACHE_PREFIX + postId;
        
        try {
            redisHelper.stringDelete(cacheKey);
            log.info("【evictCache-缓存路径-成功】成功删除帖子");
        } catch (Exception e) {
            log.error("【evictCache-缓存路径-异常】删除帖子缓存失败，postId: {}", postId, e);
        }
    }
}
