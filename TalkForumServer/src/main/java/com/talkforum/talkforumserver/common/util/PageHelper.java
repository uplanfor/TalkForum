package com.talkforum.talkforumserver.common.util;

public class PageHelper {
    /**
     * 对分页大小进行过滤
     * @param pageSize 传入的分页大小
     * @return 过滤后的分页大小
     */
    public static int filterPageSize(int pageSize){
        return pageSize <= 0 ? 5 : (Math.min(pageSize, 10));
    }

    /**
     * 对分页大小进行过滤
     * @param pageSize 传入的分页大小
     * @return 过滤后的分页大小
     */
    public static int filterPageSize(int pageSize, int min, int max){
        return (pageSize <= 0 || pageSize <= min) ? min : Math.min(pageSize, max);
    }

    /**
     * 计算分页偏移（不检查pageSize)
     * @param pageSize 页面大小
     * @param page 页码
     * @return 分页偏移
     */
    public static int calcOffsetNoCheck(int pageSize, int page){
        return (page - 1) * pageSize;
    }
}
