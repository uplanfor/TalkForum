/**
 * 帖子容器组件
 * 用于展示帖子列表，支持无限滚动加载、标签切换、刷新和重新加载功能
 * 可根据targetType和targetId获取特定用户或俱乐部的帖子
 */
import "./styles/style_postscontainer.css";
import { useState, useEffect, useCallback, useRef } from "react";
import InfiniteScroll from "react-infinite-scroller";
import PostCard, { type PostCardProps } from "./PostCard";
import PostCardPlaceholder from "./PostCardPlaceholder";
import { postsGetPostList } from "../api/ApiPosts";
import { debounce } from "../utils/debounce&throttle";
import { requestSimpleUserInfoCache } from "../utils/simpleUserInfoCache";
import { getCache, setCache } from "../utils/postsContainerCache";
import type ApiResponse from "../api/ApiResponse";
import { useDispatch, useSelector } from "react-redux";
import { type RootState, type AppDispatch } from "../store";

/**
 * 帖子容器组件的目标类型常量
 */ 
export const PostContainerTargetType = {
  SELF: "self",    // 自己的空间
  HOME: "home",    // 首页
  USER: "user",    // 其他用户的空间
  CLUB: "club"     // 俱乐部空间
} as const;

type PostContainerTargetType = typeof PostContainerTargetType[keyof typeof PostContainerTargetType];

/**
 * 帖子容器组件属性接口
 */
interface PostContainerProps {
  targetType: PostContainerTargetType;  // 目标类型
  targetId?: number;                    // 目标ID（可选）
  defaultTab?: number;                  // 默认选中的标签索引（可选）
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
}: PostContainerProps) => {  
  // Redux dispatch钩子
  const dispatch = useDispatch<AppDispatch>();
  
  // 从Redux获取用户信息
  const {following} = useSelector((state: RootState) => state.user);

  // 帖子数据状态
  const [posts, setPosts] = useState<PostCardProps[]>([]);
  
  // 是否还有更多帖子状态
  const [hasMore, setHasMore] = useState(true);
  
  // 分页游标状态
  const [cursor, setCursor] = useState<number | null>(null);
  
  // 是否正在刷新状态
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // 是否发生错误状态
  const [isError, setIsError] = useState(false);
  
  // API请求锁状态，防止并发请求
  const [isLoading, setIsLoading] = useState(false);
  // 使用ref跟踪加载状态，避免闭包问题
  const isLoadingRef = useRef(false);
  
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

  // 统一处理缓存检查、tabs生成和初始加载的useEffect
  useEffect(() => {
    // 根据targetType动态生成tabs
    let newTabs: string[] = [];
    
    switch (targetType) {
      case PostContainerTargetType.SELF:
        newTabs = ["All", "Essence", "Likes"];
        break;
      case PostContainerTargetType.HOME:
          newTabs = ["Latest", "Essence", "Following"];
        break;
      case PostContainerTargetType.USER:
        newTabs = ["All", "Essence"];
        break;
      case PostContainerTargetType.CLUB:
        newTabs = ["Latest", "Essence"];
        break;
      default:
        newTabs = [];
    }
    
    setTabs(newTabs);
    
    // 检查是否有缓存数据
    const cacheItem = getCache(targetType, targetId);
    
    if (cacheItem) {
      // 使用缓存的数据
      setPosts(cacheItem.posts);
      setCursor(cacheItem.cursor);
      setHasMore(cacheItem.hasMore);
      setIsError(false);
      setIsRefreshing(false);
      // 使用缓存的标签索引，确保不超出新生成的tabs长度
      setCurTabIndex(Math.min(cacheItem.curTabIndex, newTabs.length - 1));
      hasInitialLoaded.current = true; // 标记已加载，避免后续重复加载
    } else {
      // 没有缓存，重置状态
      setCursor(null);
      setPosts([]);
      setIsError(false);
      setHasMore(true);
      setIsRefreshing(false);
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
  }, [targetType, targetId, defaultTab, following]); // 只依赖following，而不是整个user对象

  /**
   * 处理刷新操作
   * 重置所有状态，重新加载帖子列表
   */
  const handleRefresh = async () => {
    // 如果API请求已在进行中，则不执行刷新操作
    if (isLoadingRef.current) {
      return;
    }
    
    setIsRefreshing(true);
    setCursor(null);
    setPosts([]);
    setIsError(false);
    setHasMore(true);
    // 不重置hasInitialLoaded，避免影响初始加载逻辑
    
    // 触发loadMore来加载新的帖子
    await loadMore();
    setIsRefreshing(false);
  };

  /**
   * 处理重新加载操作
   * 重置错误状态，尝试重新加载帖子
   */
  const handleReload = async () => {
    setIsError(false);
    setHasMore(true);
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
    if (index === curTabIndex) { return; }
    
    // 更新当前选中的标签索引
    setCurTabIndex(index);
    
    // 立即重置状态并开始加载新数据
    setIsRefreshing(true);
    setCursor(null);
    setPosts([]);
    setIsError(false);
    setHasMore(true);
    // 不重置hasInitialLoaded，避免影响初始加载逻辑
    
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
    // 如果没有更多帖子、发生错误、正在刷新或API请求已在进行中，则不执行任何操作
    if (!hasMore || isError || isRefreshing || isLoadingRef.current) {
      return;
    }

    // 获取当前标签
    const currentTab = tabsRef.current[curTabIndexRef.current];
    
    // 如果是CLUB类型，按照要求什么都不显示
    if (targetType === PostContainerTargetType.CLUB) {
      setHasMore(false);
      // 更新缓存
      setCache(targetType, targetId, {
        posts: [],
        hasMore: false,
        cursor: null,
        curTabIndex: curTabIndexRef.current
      });
      return;
    }

    // 如果是SELF或USER类型的Likes标签，按照要求什么都不显示
    if ((targetType === PostContainerTargetType.SELF || targetType === PostContainerTargetType.USER) && 
        currentTab === "Likes") {
      setHasMore(false);
      // 更新缓存
      setCache(targetType, targetId, {
        posts: [],
        hasMore: false,
        cursor: null,
        curTabIndex: curTabIndexRef.current
      });
      return;
    }

    try {
        // 设置API请求锁为true（使用ref立即更新）
        isLoadingRef.current = true;
        setIsLoading(true);

        if (currentTab == undefined) {
          return;
        }
        
        // 根据当前标签和targetType确定查询参数
        const queryParams: any = { cursor, pageSize: 10 };
        
        // 根据当前标签设置过滤条件
        if (currentTab === "Essence") {
          // 查询精华帖 - 确保传递isEssence参数
          queryParams.isEssence = 1;
        } else if (currentTab === "Latest") {
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
            if (currentTab === "Following") {
              // 添加关注用户的ID到查询参数
              queryParams.userIds = [0, ...following];
            }
            break;
          case PostContainerTargetType.USER:
            // USER类型：查询指定用户的帖子
            queryParams.userIds = [targetId!];
            break;
          case PostContainerTargetType.CLUB:
            // CLUB类型：已经在前面处理，这里不会执行到
            break;
        }

        console.log("API调用参数:", {
          targetType,
          targetId,
          currentTab,
          queryParams,
          cursor
        });

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
              reject(err)
            }
          }, 1024);
        });

        // 加载成功，更新状态
        // 如果是刷新或初始加载，则替换帖子列表，否则追加到现有列表
        let updatedPosts: PostCardProps[] = [];
        if (result.data?.data) {
          updatedPosts = result.data.data;
        }
        
        if (isRefreshing || cursor === null) {
          setPosts(updatedPosts);
        } else {
          setPosts(prevPosts => [...prevPosts, ...updatedPosts]);
        }

        // 更新分页游标
        const updatedCursor = result.data?.nextCursor || null;
        setCursor(updatedCursor);

        // 设置是否还有更多帖子
        const updatedHasMore = !!result.data?.nextCursor;
        setHasMore(updatedHasMore);

        // 更新缓存
        setCache(targetType, targetId, {
          posts: isRefreshing || cursor === null ? updatedPosts : [...posts, ...updatedPosts],
          hasMore: updatedHasMore,
          cursor: updatedCursor,
          curTabIndex: curTabIndexRef.current
        });

      } catch (error) {
        // 加载失败，设置错误状态
        setIsError(true);
        // console.error("加载帖子失败:", error);
        
        // 发生错误时不更新缓存，保持之前的数据
      } finally {
        // 无论请求成功还是失败，都释放API请求锁
        isLoadingRef.current = false;
        setIsLoading(false);
        setIsRefreshing(false);
      }
  }, [targetType, targetId, following]); // 减少依赖项，只依赖必要的props

  /**
   * 防抖处理的加载更多方法
   * 限制调用频率，防止频繁请求API
   */
  const debounceLoadMore = useRef(debounce(() => loadMore(), 1000)).current;

  return (
    <div className="container">
      <div className="list">
        {/* 标签栏（如果有标签） */}
        {tabs.length > 0 && (
          <div className="tabs">
            {tabs.map((tab, index) => (
              <span 
                key={index} 
                className={`tab ${index === curTabIndex ? "active" : ""}`} 
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
          hasMore={hasMore} 
          threshold={512} 
          loader={
            (<div key={0}> {!isError &&
              <>
                <PostCardPlaceholder />
                <PostCardPlaceholder />
              </>}
            </div>)
          }
        >
          {/* 帖子列表 */}
          {posts.map((post) => (
            <PostCard key={post.id} {...post}/>
          ))}
          
          {/* 没有更多帖子提示 */}
          {(!hasMore && posts.length === 0) && <div style={{ textAlign: "center" }}>No posts found</div>}
          {(!hasMore && posts.length > 0) && <div style={{ textAlign: "center" }}>No more posts</div>}
          
          {/* 错误提示和重新加载按钮 */}
          {isError && <div style={{ textAlign: "center" }}>Error occurred, hit <button onClick={handleReload}>ME</button> to reload.</div>}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default PostContainer;