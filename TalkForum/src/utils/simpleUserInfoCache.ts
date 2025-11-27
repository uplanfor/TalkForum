import { usersGetSimpleUsersInfo, type SimpleUserInfo } from "../api/ApiUsers"
import { DefaultAvatarUrl } from "../constants/default";
const cache = new Map<number, SimpleUserInfo>();

const requestSimpleUserInfoCache = async (userId: number[]) => {
    const notInCache = userId.filter((id) => !cache.has(id));
    await updateSimpleUserInfoCache(notInCache);
}


const updateSimpleUserInfoCache = async (userId: number[]) => {
    try {
        if (userId.length === 0) {
            return;
        }
        const cacheResult = await usersGetSimpleUsersInfo(userId);
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
}


const getSingleSimpleUserInfo = (userId: number) : SimpleUserInfo=> {
    if (cache.has(userId)) {
        return cache.get(userId) as SimpleUserInfo;
    }
    return {
        avatarLink: DefaultAvatarUrl,
        name: "UNKNOWN",
    }
}

export {
    updateSimpleUserInfoCache,
    getSingleSimpleUserInfo,
    requestSimpleUserInfoCache,
}