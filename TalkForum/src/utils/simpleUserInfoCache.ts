import { usersGetSimpleUsersInfo, type SimpleUserInfo } from '../api/ApiUsers';
import { DefaultAvatarUrl } from '../constants/default';
const cache = new Map<number, SimpleUserInfo>();

/**
 * 请求获取用户信息并更新缓存（会去重,filter掉已经缓存的用户）
 * @param userIds 用户id列表
 */
const requestSimpleUserInfoCache = async (userIds: number[]) => {
    const notInCache = userIds.filter(id => !cache.has(id));
    await updateSimpleUserInfoCache(notInCache);
};

/**
 * 更新缓存(不去重，有则覆盖，无则更新)
 * @param userIds 用户id列表
 */
const updateSimpleUserInfoCache = async (userIds: number[]) => {
    try {
        if (userIds.length === 0) {
            return;
        }
        const cacheResult = await usersGetSimpleUsersInfo(userIds);
        if (cacheResult.success && cacheResult.data?.length > 0) {
            cacheResult.data.forEach((item: any) => {
                cache.set(item.id, {
                    avatarLink: item.avatarLink,
                    name: item.name,
                });
            });
        }
    } catch (error) {
        console.error(error);
    }
};

/**
 * 用于获取用户简单信息，优先从缓存中获取，如果缓存中没有，则失败
 * @param userId 用户id
 * @returns 简单用户信息
 */
const getSingleSimpleUserInfo = (userId: number): SimpleUserInfo => {
    if (cache.has(userId)) {
        return cache.get(userId) as SimpleUserInfo;
    }
    return {
        avatarLink: DefaultAvatarUrl,
        name: 'UNKNOWN',
    };
};

export { updateSimpleUserInfoCache, getSingleSimpleUserInfo, requestSimpleUserInfoCache };
