-- 限流Key（ZSet）
local key = KEYS[1]
-- 窗口时间（ms）
local window = tonumber(ARGV[1])
-- 限流次数
local limit = tonumber(ARGV[2])
-- 当前时间戳（ms）
local now = tonumber(ARGV[3])
-- 过期时间（窗口时间+1秒，避免无用key占用内存）
local expire = window + 1000

-- 1. 删除窗口外的过期记录（score < now - window）
redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
-- 2. 统计当前窗口内的请求数
local count = redis.call('ZCARD', key)
-- 3. 判断是否超限
if count < limit then
    -- 3.1 未超限：添加当前时间戳（value用UUID避免重复）
    redis.call('ZADD', key, now, now .. '_' .. math.random(100000))
    -- 3.2 设置Key过期时间
    redis.call('EXPIRE', key, expire / 1000)
    -- 3.3 返回1（放行）
    return 1
else
    -- 3.4 超限：返回0（拦截）
    return 0
end