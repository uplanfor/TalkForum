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
import { useDispatch, useSelector } from 'react-redux';
import { type RootState, type AppDispatch } from '../store';
import { useTranslation } from 'react-i18next';
import type { ApiResponse } from '../utils/Request';

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
    userIds?: string[];
    tag?: string;
    keyword: string;
    clubIds?: string[];
}

/**
 * 帖子容器组件属性接口
 */
interface PostContainerProps {
    targetType: PostContainerTargetType; // 目标类型
    targetId?: string; // 目标ID（可选）
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
    searchParams
}: PostContainerProps) => {
    console.log("search params init", searchParams);
    
    const { t } = useTranslation();
    // const dispatch = useDispatch<AppDispatch>();

    const { following } = useSelector((state: RootState) => state.user);

    const [posts, setPosts] = useState<PostCardProps[]>([]);

    // 使用ref管理状态，防止不必要的重新渲染
    const hasMoreRef = useRef(true);
    const cursorRef = useRef<string | null>(null);
    const isRefreshingRef = useRef(false);
    const isErrorRef = useRef(false);
    const isLoadingRef = useRef(false);

    const removePost = (id: string) => {
        setPosts(posts.filter(post => post.id !== id));
    };

    // 根据targetType生成对应的tabs
    const [tabs, setTabs] = useState<string[]>([]);

    // 当前选中的标签索引状态
    const [curTabIndex, setCurTabIndex] = useState(defaultTab);

    const curTabIndexRef = useRef(curTabIndex);
    const tabsRef = useRef(tabs);
    const hasInitialLoaded = useRef(false);

    // 同步ref和state
    curTabIndexRef.current = curTabIndex;
    tabsRef.current = tabs;

    // 统一处理缓存检查、tabs生成和初始加载的useEffect
    useEffect(() => {
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

        cursorRef.current = null;
        setPosts([]);
        isErrorRef.current = false;
        hasMoreRef.current = true;
        isRefreshingRef.current = false;
        
        // 设置默认标签索引，确保不超出新生成的tabs长度
        setCurTabIndex(Math.min(defaultTab, newTabs.length - 1));

        // 只有在未加载过的情况下才执行初始加载
        if (!hasInitialLoaded.current) {
            hasInitialLoaded.current = true;
        }
    }, [targetType, targetId, defaultTab, searchParams]);

    // 监听搜索参数变化，如果是SEARCH模式，则重新加载数据
    useEffect(() => {
        // 如果是SEARCH模式且搜索参数发生变化，则重新加载数据
        if (
            targetType === PostContainerTargetType.SEARCH &&
            hasInitialLoaded.current &&
            searchParams
        ) {
            // 重置状态
            cursorRef.current = null;
            setPosts([]);
            isErrorRef.current = false;
            hasMoreRef.current = true;
            // isRefreshingRef.current = true;
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
        isRefreshingRef.current = true;
        cursorRef.current = null;
        setPosts([]);
        isErrorRef.current = false;
        hasMoreRef.current = true;

        isRefreshingRef.current = false;
    };

    /**
     * 处理重新加载操作
     * 重置错误状态，尝试重新加载帖子
     */
    const handleReload = async () => {
        isErrorRef.current = false;
        hasMoreRef.current = true;
        loadMore();
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

        // 更新当前选中的标签索引
        setCurTabIndex(index);

        // 重置所有状态到第一次加载的状态
        // isRefreshingRef.current = true;
        cursorRef.current = null;
        setPosts([]);
        isErrorRef.current = false;
        hasMoreRef.current = true;

        // 再次检查是否仍然需要加载
        if (index === curTabIndexRef.current) {
            loadMore();
        }
    };

    /**
     * 处理加载更多帖子
     * 根据targetType、targetId和当前标签获取对应的帖子列表
     */
    const loadMore = useCallback(async () => {
        if (
            !hasMoreRef.current ||
            isErrorRef.current ||
            isRefreshingRef.current ||
            isLoadingRef.current
        ) {
            return;
        }

        // 获取当前标签
        const currentTab = tabsRef.current[curTabIndexRef.current];
        if (currentTab == undefined) {
            return;
        }

        // 如果是CLUB类型
        if (targetType === PostContainerTargetType.CLUB) {
            hasMoreRef.current = false;
            return;
        }

        // 如果是SELF或USER类型的Likes标签
        if (
            (targetType === PostContainerTargetType.SELF ||
                targetType === PostContainerTargetType.USER) &&
            currentTab === 'Likes'
        ) {
            hasMoreRef.current = false;
            return;
        }

        console.log("call loadmore? ", searchParams);

        try {
            isLoadingRef.current = true;
            let queryParams: any = { cursor: cursorRef.current, pageSize: 10 };

            // 根据当前标签设置过滤条件
            if (currentTab === t('postsContainer.essenceTab')) {
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
                        console.log("following", following);
                        
                        queryParams.userIds = ["0", ...following];
                        console.log("userIDs", queryParams.userIds)
                    }
                    break;
                case PostContainerTargetType.USER:
                    // USER类型：查询指定用户的帖子
                    queryParams.userIds = [targetId!];
                    break;
                case PostContainerTargetType.SEARCH:
                    // SEARCH类型：使用父组件传递的搜索参数
                    console.log("search", searchParams);
                    
                    if (searchParams) {
                        queryParams = { ...queryParams, ...searchParams };
                        console.log(queryParams);
                    }
                    break;
                // case PostContainerTargetType.CLUB:
                //   // CLUB类型：已经在前面处理，这里不会执行到
                //   break;
            }

            // console.log('real load more!');

            const result = await new Promise<ApiResponse>((resolve, reject) => {
                setTimeout(async () => {
                    try {
                        // 获取帖子列表
                        const res = await postsGetPostList(queryParams);

                        // 收集需要缓存的用户ID
                        let needCacheTarget: string[] = [];
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
            cursorRef.current = updatedCursor;

            // 设置是否还有更多帖子
            const updatedHasMore = result.data?.hasMore === true;
            hasMoreRef.current = updatedHasMore;
        } catch (error) {
            isErrorRef.current = true;
        } finally {
            isLoadingRef.current = false;
            isRefreshingRef.current = false;
        }
    }, [targetType, targetId, searchParams]);

    const debounceLoadMore = debounce(loadMore, 500);

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