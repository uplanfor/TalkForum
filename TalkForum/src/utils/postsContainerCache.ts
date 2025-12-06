/**
 * 帖子容器组件缓存工具
 * 用于缓存不同targetType和targetId组合下的帖子列表数据和标签状态
 */
import type { PostCardProps } from '../components/PostCard';
import type { PostContainerTargetType } from '../components/PostsContainer';

/**
 * 缓存项接口
 */
interface CacheItem {
  // 帖子列表数据
  posts: PostCardProps[];
  // 是否还有更多帖子
  hasMore: boolean;
  // 分页游标
  cursor: number | null;
  // 当前选中的标签索引
  curTabIndex: number;
  // 缓存时间戳
  timestamp: number;
}

/**
 * 缓存映射表
 * 键为 `${targetType}-${targetId || 'null'}`
 */
const cache = new Map<string, CacheItem>();

/**
 * 获取缓存的复合键
 * @param targetType 目标类型
 * @param targetId 目标ID
 * @returns 复合键字符串
 */
const getCacheKey = (targetType: PostContainerTargetType, targetId?: number): string => {
  return `${targetType}-${targetId || 'null'}`;
};

/**
 * 获取缓存数据
 * @param targetType 目标类型
 * @param targetId 目标ID
 * @returns 缓存项或undefined
 */
export const getCache = (targetType: PostContainerTargetType, targetId?: number): CacheItem | undefined => {
  const cacheItem = cache.get(getCacheKey(targetType, targetId));
  if (cacheItem && isCacheValid(cacheItem)) {
    return cacheItem;
  }
  // 如果缓存无效，则清除它
  if (cacheItem) {
    clearCache(targetType, targetId);
  }
  return undefined;
};


/**
 * 设置缓存数据
 * @param targetType 目标类型
 * @param targetId 目标ID
 * @param cacheItem 缓存项
 */
export const setCache = (targetType: PostContainerTargetType, targetId: number | undefined, cacheItem: Omit<CacheItem, 'timestamp'>): void => {
  cache.set(getCacheKey(targetType, targetId), {
    ...cacheItem,
    timestamp: Date.now()
  });
};

/**
 * 清除缓存
 * @param targetType 目标类型
 * @param targetId 目标ID
 */
export const clearCache = (targetType: PostContainerTargetType, targetId?: number): void => {
  cache.delete(getCacheKey(targetType, targetId));
};

/**
 * 清除所有缓存
 */
export const clearAllCache = (): void => {
  cache.clear();
};

/**
 * 检查缓存是否有效（可选：可以添加缓存过期时间检查）
 * @param cacheItem 缓存项
 * @param maxAge 最大缓存时间（毫秒）
 * @returns 是否有效
 */
export const isCacheValid = (cacheItem: CacheItem, maxAge: number = 30 * 60 * 1000): boolean => {
  return Date.now() - cacheItem.timestamp < maxAge;
};
