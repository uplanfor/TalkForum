/**
 * 帖子容器组件
 * 用于展示帖子列表，支持无限滚动加载、标签切换、刷新和重新加载功能
 * 可根据targetType和targetId获取特定用户或俱乐部的帖子
 */
import './styles/style_postscontainer.css';
import { useState, useEffect, useCallback, useRef, useReducer } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import PostCard, { type PostCardProps } from './PostCard';
import PostCardPlaceholder from './PostCardPlaceholder';
import { postsGetPostList } from '../api/ApiPosts';
import { debounce } from '../utils/debounce&throttle';
import { requestSimpleUserInfoCache } from '../utils/simpleUserInfoCache';
import { clearPostsCache, getPostsCache, setPostsCache } from '../utils/postsContainerCache';
import type ApiResponse from '../api/ApiResponse';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState, type AppDispatch } from '../store';
import { useTranslation } from 'react-i18next';

/**
 * 帖子容器组件的目标类型常量
 */
export const PostContainerTargetType = {
    SELF: 'self',             // 自己的空间
    HOME: 'home',             // 首页
    USER: 'user',             // 其他用户的空间
    CLUB: 'club',             // 圈子空间
    TAG: 'tag',                // 标签空间
    SEARCH: 'search',          // 搜索空间
} as const;

export type PostContainerTargetType =
    (typeof PostContainerTargetType)[keyof typeof PostContainerTargetType];

/**
 * 帖子容器搜索参数接口
 */
export interface PostsContainerSearchParams {
    userIds?: number[];
    tag?: string;
    keyword: string;
    clubIds?: number[];
}

/**
 * 帖子容器组件属性接口
 */
interface PostContainerProps {
    targetType: PostContainerTargetType; // 目标类型
    targetId?: number; // 目标ID（可选）
    defaultTab?: number; // 默认选中的标签索引（可选）
    searchParams?: PostsContainerSearchParams; // 搜索参数（仅SEARCH模式需要）
}

/**
 * 帖子容器组件
 * @param {PostContainerProps} props - 组件属性
 * @returns {JSX.Element} 帖子容器组件
 */
const PostContainer = ({
    targetType,
    targetId,
    defaultTab = 0,
    searchParams,
}: PostContainerProps) => {
    // 国际化钩子
    const { t } = useTranslation();

    // Redux dispatch钩子
    const dispatch = useDispatch<AppDispatch>();

    // 从Redux获取用户信息
    const { following } = useSelector((state: RootState) => state.user);

    // 帖子数据状态
    const [posts, setPosts] = useState<PostCardProps[]>([]);

    // 使用ref管理状态，防止不必要的重新渲染
    const hasMoreRef = useRef(true);
    const cursorRef = useRef<number | null>(null);
    const isRefreshingRef = useRef(false);
    const isErrorRef = useRef(false);
    const isLoadingRef = useRef(false);

    const removePost = (id: number) => {
        setPosts(posts.filter(post => post.id !== id));
    };

    // 使用useState仅用于触发UI更新
    const [, forceUpdate] = useReducer(x => x + 1, 0);

    // 状态更新辅助函数
    const updateHasMore = (value: boolean) => {
        hasMoreRef.current = value;
        forceUpdate();
    };

    const updateCursor = (value: number | null) => {
        cursorRef.current = value;
        forceUpdate();
    };

    const updateIsRefreshing = (value: boolean) => {
        isRefreshingRef.current = value;
        forceUpdate();
    };

    const updateIsError = (value: boolean) => {
        isErrorRef.current = value;
        forceUpdate();
    };

    const updateIsLoading = (value: boolean) => {
        isLoadingRef.current = value;
        forceUpdate();
    };

    // 根据targetType生成对应的tabs
    const [tabs, setTabs] = useState<string[]>([]);

    // 当前选中的标签索引状态
    const [curTabIndex, setCurTabIndex] = useState(defaultTab);

    // 使用ref存储当前标签和tab信息，避免闭包问题
    const curTabIndexRef = useRef(curTabIndex);
    const tabsRef = useRef(tabs);

    // 使用useRef来跟踪是否已经执行过初始加载，解决React StrictMode下重复加载的问题
    const hasInitialLoaded = useRef(false);

    // 同步ref和state
    useEffect(() => {
        curTabIndexRef.current = curTabIndex;
    }, [curTabIndex]);

    useEffect(() => {
        tabsRef.current = tabs;
    }, [tabs]);

    // debugger;

    // 统一处理缓存检查、tabs生成和初始加载的useEffect
    useEffect(() => {
        // 根据targetType动态生成tabs
        let newTabs: string[] = [];

        switch (targetType) {
            case PostContainerTargetType.SELF:
                newTabs = [
                    t('postsContainer.allTab'),
                    t('postsContainer.essenceTab'),
                    t('postsContainer.likesTab'),
                ];
                break;
            case PostContainerTargetType.HOME:
                newTabs = [
                    t('postsContainer.latestTab'),
                    t('postsContainer.essenceTab'),
                    t('postsContainer.followingTab'),
                ];
                break;
            case PostContainerTargetType.USER:
                newTabs = [t('postsContainer.allTab'), t('postsContainer.essenceTab')];
                break;
            case PostContainerTargetType.CLUB:
                newTabs = [t('postsContainer.latestTab'), t('postsContainer.essenceTab')];
                break;
            case PostContainerTargetType.TAG:
                newTabs = [t('postsContainer.latestTab'), t('postsContainer.essenceTab')];
                break;
            case PostContainerTargetType.SEARCH:
                newTabs = [t('postsContainer.latestTab'), t('postsContainer.essenceTab')];
                break;
            default:
                newTabs = [];
        }

        setTabs(newTabs);

        // 检查是否有缓存数据
        // 对于SEARCH模式，使用传递的searchParams作为缓存键的一部分
        const searchParamsString =
            targetType === PostContainerTargetType.SEARCH && searchParams
                ? JSON.stringify(searchParams)
                : undefined;
        const cacheItem = getPostsCache(targetType, targetId, searchParamsString);

        if (cacheItem) {
            // 使用缓存的数据
            setPosts(cacheItem.posts);
            updateCursor(cacheItem.cursor);
            updateHasMore(cacheItem.hasMore);
            updateIsError(false);
            updateIsRefreshing(false);
            // 使用缓存的标签索引，确保不超出新生成的tabs长度
            setCurTabIndex(Math.min(cacheItem.curTabIndex, newTabs.length - 1));
            hasInitialLoaded.current = true; // 标记已加载，避免后续重复加载
        } else {
            // 没有缓存，重置状态
            updateCursor(null);
            setPosts([]);
            updateIsError(false);
            updateHasMore(true);
            updateIsRefreshing(false);
            // 设置默认标签索引，确保不超出新生成的tabs长度
            setCurTabIndex(Math.min(defaultTab, newTabs.length - 1));

            // 只有在未加载过的情况下才执行初始加载
            if (!hasInitialLoaded.current) {
                hasInitialLoaded.current = true;
                // 使用setTimeout确保在下一个事件循环中调用loadMore，避免在当前渲染周期内调用
                setTimeout(() => {
                    loadMore();
                }, 0);
            }
        }
    }, [targetType, targetId, defaultTab, following, searchParams]); // 添加searchParams作为依赖项

    // 监听搜索参数变化，如果是SEARCH模式，则重新加载数据
    useEffect(() => {
        // 如果是SEARCH模式且搜索参数发生变化，则重新加载数据
        if (
            targetType === PostContainerTargetType.SEARCH &&
            hasInitialLoaded.current &&
            searchParams
        ) {
            // 重置状态
            updateCursor(null);
            setPosts([]);
            updateIsError(false);
            updateHasMore(true);
            // updateIsRefreshing(true);

            // 对于SEARCH模式，不使用缓存，直接重新加载数据

            // 直接调用loadMore函数，避免将其作为依赖项
            const reloadData = async () => {
                await loadMore();
            };

            // 使用setTimeout确保在下一个事件循环中调用reloadData
            setTimeout(() => {
                reloadData();
            }, 0);
        }
    }, [searchParams, targetType, targetId]);

    /**
     * 处理刷新操作
     * 重置所有状态，重新加载帖子列表
     */
    const handleRefresh = async () => {
        // 如果API请求已在进行中，则不执行刷新操作
        if (isLoadingRef.current) {
            return;
        }

        // 对于SEARCH模式，使用传递的searchParams作为缓存键的一部分
        const searchParamsString =
            targetType === PostContainerTargetType.SEARCH && searchParams
                ? JSON.stringify(searchParams)
                : undefined;

        // 清除当前缓存
        clearPostsCache(targetType, targetId, searchParamsString);

        updateIsRefreshing(true);
        updateCursor(null);
        setPosts([]);
        updateIsError(false);
        updateHasMore(true);
        // 不重置hasInitialLoaded，避免影响初始加载逻辑

        // 触发loadMore来加载新的帖子
        await loadMore();
        updateIsRefreshing(false);
    };

    // console.log("posts container", searchParams);

    /**
     * 处理重新加载操作
     * 重置错误状态，尝试重新加载帖子
     */
    const handleReload = async () => {
        updateIsError(false);
        updateHasMore(true);
        // 不重置hasInitialLoaded，避免影响初始加载逻辑
        // 触发loadMore来重新加载帖子
        await loadMore();
    };

    /**
     * 处理标签切换操作
     * @param {number} index - 要切换到的标签索引
     */
    const changeTab = async (index: number) => {
        // 如果点击的是当前选中的标签，则不执行任何操作
        if (index === curTabIndex) {
            return;
        }

        // 如果正在加载中，则不允许切换标签
        if (isLoadingRef.current) {
            return;
        }

        // 对于SEARCH模式，使用传递的searchParams作为缓存键的一部分
        const searchParamsString =
            targetType === PostContainerTargetType.SEARCH && searchParams
                ? JSON.stringify(searchParams)
                : undefined;

        // 更新当前选中的标签索引
        setCurTabIndex(index);

        // 重置所有状态到第一次加载的状态
        // updateIsRefreshing(true);
        updateCursor(null);
        setPosts([]);
        updateIsError(false);
        updateHasMore(true);

        // 等待状态更新后再调用loadMore
        // 使用flushSync确保状态同步更新
        await new Promise(resolve => {
            setTimeout(resolve, 0);
        });

        // 再次检查是否仍然需要加载（防止用户快速切换标签）
        if (index === curTabIndexRef.current) {
            loadMore();
        }
    };

    /**
     * 处理加载更多帖子
     * 根据targetType、targetId和当前标签获取对应的帖子列表
     */
    const loadMore = useCallback(async () => {
        // console.log('try load more');
        // 如果没有更多帖子、发生错误、正在刷新或API请求已在进行中，则不执行任何操作
        if (
            !hasMoreRef.current ||
            isErrorRef.current ||
            isRefreshingRef.current ||
            isLoadingRef.current
        ) {
            // console.log(
            //     !hasMoreRef.current,
            //     isErrorRef.current,
            //     isRefreshingRef.current,
            //     isLoadingRef.current,
            //     'hit!'
            // );
            return;
        }

        // 获取当前标签
        const currentTab = tabsRef.current[curTabIndexRef.current];
        if (currentTab == undefined) {
            // console.log('hit!');
            return;
        }

        // 对于SEARCH模式，使用传递的searchParams作为缓存键的一部分
        const searchParamsString =
            targetType === PostContainerTargetType.SEARCH && searchParams
                ? JSON.stringify(searchParams)
                : undefined;

        // 如果是CLUB类型，按照要求什么都不显示
        if (targetType === PostContainerTargetType.CLUB) {
            updateHasMore(false);
            // 更新缓存
            setPostsCache(targetType, targetId, searchParamsString, {
                posts: [],
                hasMore: false,
                cursor: null,
                curTabIndex: curTabIndexRef.current,
            });
            return;
        }

        // 如果是SELF或USER类型的Likes标签，按照要求什么都不显示
        if (
            (targetType === PostContainerTargetType.SELF ||
                targetType === PostContainerTargetType.USER) &&
            currentTab === 'Likes'
        ) {
            updateHasMore(false);
            // 更新缓存
            setPostsCache(targetType, targetId, searchParamsString, {
                posts: [],
                hasMore: false,
                cursor: null,
                curTabIndex: curTabIndexRef.current,
            });
            return;
        }

        try {
            // 设置API请求锁为true（使用ref立即更新）
            isLoadingRef.current = true;
            updateIsLoading(true);

            // 根据当前标签和targetType确定查询参数
            const queryParams: any = { cursor: cursorRef.current, pageSize: 10 };

            // 根据当前标签设置过滤条件
            if (currentTab === t('postsContainer.essenceTab')) {
                // 查询精华帖 - 确保传递isEssence参数
                queryParams.isEssence = 1;
            } else if (currentTab === t('postsContainer.latestTab')) {
                // 查询最新帖子（默认就是按时间倒序，不需要额外参数）
            }

            // 根据targetType设置查询目标
            switch (targetType) {
                case PostContainerTargetType.SELF:
                    // SELF类型：查询自己的帖子
                    queryParams.userIds = [targetId!];
                    break;
                case PostContainerTargetType.HOME:
                    // HOME类型：查询首页帖子，可能需要根据标签过滤
                    if (currentTab === t('postsContainer.followingTab')) {
                        // 添加关注用户的ID到查询参数
                        queryParams.userIds = [0, ...following];
                    }
                    break;
                case PostContainerTargetType.USER:
                    // USER类型：查询指定用户的帖子
                    queryParams.userIds = [targetId!];
                    break;
                case PostContainerTargetType.SEARCH:
                    // SEARCH类型：使用父组件传递的搜索参数
                    if (searchParams) {
                        // 添加关键词
                        if (searchParams.keyword) {
                            queryParams.keyword = searchParams.keyword;
                        }

                        // 添加用户ID列表
                        if (searchParams.userIds && searchParams.userIds.length > 0) {
                            queryParams.userIds = searchParams.userIds;
                        }

                        // 添加标签
                        if (searchParams.tag) {
                            queryParams.tag = searchParams.tag;
                        }

                        // 添加俱乐部ID列表
                        if (searchParams.clubIds && searchParams.clubIds.length > 0) {
                            queryParams.clubIds = searchParams.clubIds;
                        }
                    }
                    break;
                // case PostContainerTargetType.CLUB:
                //   // CLUB类型：已经在前面处理，这里不会执行到
                //   break;
            }

            // console.log("API调用参数:", {
            //   targetType,
            //   targetId,
            //   currentTab,
            //   queryParams,
            //   cursor
            // });

            console.log('real load more!');

            // 使用Promise包装API请求，添加延迟以模拟真实网络请求
            const result = await new Promise<ApiResponse>((resolve, reject) => {
                setTimeout(async () => {
                    try {
                        // 获取帖子列表
                        const res = await postsGetPostList(queryParams);
                        // console.log("API响应:", {
                        //   dataCount: res.data?.data?.length || 0,
                        //   nextCursor: res.data?.nextCursor,
                        //   isEssenceParam: queryParams.isEssence
                        // });

                        // 收集需要缓存的用户ID
                        let needCacheTarget: number[] = [];
                        if (res.data?.data) {
                            res.data.data.forEach((item: PostCardProps) => {
                                const userId = item.userId;
                                if (!needCacheTarget.includes(userId)) {
                                    needCacheTarget.push(userId);
                                }
                            });
                        }

                        // 缓存用户信息
                        if (needCacheTarget.length > 0) {
                            await requestSimpleUserInfoCache(needCacheTarget);
                        }
                        resolve(res);
                    } catch (err) {
                        // console.error("API调用失败:", err);
                        reject(err);
                    }
                }, 1024);
            });

            // 加载成功，更新状态
            // 如果是刷新或初始加载，则替换帖子列表，否则追加到现有列表
            let updatedPosts: PostCardProps[] = [];
            if (result.data?.data) {
                updatedPosts = result.data.data;
            }

            if (isRefreshingRef.current || cursorRef.current === null) {
                setPosts(updatedPosts);
            } else {
                setPosts(prevPosts => [...prevPosts, ...updatedPosts]);
            }

            // 更新分页游标
            const updatedCursor = result.data?.cursor || null;
            updateCursor(updatedCursor);

            // 设置是否还有更多帖子
            const updatedHasMore = result.data?.hasMore === true;
            updateHasMore(updatedHasMore);

            // 更新缓存
            setPostsCache(targetType, targetId, searchParamsString, {
                posts:
                    isRefreshingRef.current || cursorRef.current === null
                        ? updatedPosts
                        : [...posts, ...updatedPosts],
                hasMore: updatedHasMore,
                cursor: updatedCursor,
                curTabIndex: curTabIndexRef.current,
            });
        } catch (error) {
            // 加载失败，设置错误状态
            updateIsError(true);
            // console.error("加载帖子失败:", error);

            // 发生错误时不更新缓存，保持之前的数据
        } finally {
            // 无论请求成功还是失败，都释放API请求锁
            isLoadingRef.current = false;
            updateIsLoading(false);
            updateIsRefreshing(false);
        }
    }, [targetType, targetId, following, searchParams]);

    /**
     * 防抖处理的加载更多方法
     * 限制调用频率，防止频繁请求API
     */
    const debounceLoadMore = useRef(debounce(loadMore, 500)).current;

    return (
        <div className='container'>
            <div className='list'>
                {/* 标签栏（如果有标签） */}
                {tabs.length > 0 && (
                    <div className='tabs'>
                        {tabs.map((tab, index) => (
                            <span
                                key={index}
                                className={`tab ${index === curTabIndex ? 'active' : ''}`}
                                onClick={() => changeTab(index)}
                            >
                                {tab}
                            </span>
                        ))}
                    </div>
                )}

                {/* 无限滚动组件 */}
                <InfiniteScroll
                    initialLoad={true}
                    loadMore={debounceLoadMore}
                    hasMore={hasMoreRef.current && !isErrorRef.current}
                    threshold={512}
                    loader={
                        <div key={0}>
                            {' '}
                            {!isErrorRef.current && (
                                <>
                                    <PostCardPlaceholder />
                                    <PostCardPlaceholder />
                                </>
                            )}
                        </div>
                    }
                >
                    {/* 帖子列表 */}
                    {posts.map(post => (
                        <PostCard key={post.id} {...post} removeSelf={removePost} />
                    ))}

                    {/* 没有更多帖子提示 */}
                    {!hasMoreRef.current && posts.length === 0 && (
                        <div style={{ textAlign: 'center' }}>
                            {t('postsContainer.noPostsFound')}
                        </div>
                    )}
                    {!hasMoreRef.current && posts.length > 0 && (
                        <div style={{ textAlign: 'center' }}>{t('postsContainer.noMorePosts')}</div>
                    )}

                    {/* 错误提示和重新加载按钮 */}
                    {isErrorRef.current && (
                        <div style={{ textAlign: 'center' }}>
                            {t('postsContainer.errorOccurred')}{' '}
                            <button onClick={handleReload}>
                                {t('postsContainer.reloadButton')}
                            </button>{' '}
                            {t('postsContainer.reloadText')}
                        </div>
                    )}
                </InfiniteScroll>
            </div>
        </div>
    );
};

export default PostContainer;
