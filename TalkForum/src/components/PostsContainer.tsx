// import "../assets/normalize.css";
import "./styles/style_postscontainer.css";
import { useState, useEffect } from "react";
// import { useSearchParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroller";
import PostCard, { type PostCardProps } from "./PostCard";
import PostCardPlaceholder from "./PostCardPlaceholder";
import { postsGetPostList } from "../api/ApiPosts";
import { debounce } from "../utils/debounce&throttle";
import { requestSimpleUserInfoCache } from "../utils/simpleUserInfoCache";
import type ApiResponse from "../api/ApiResponse";


interface PostContainerProps {
  tabs?: string[];
  defaultTab?: number;
  targetType?: "user" | "club";
  targetId?: number;
}



const PostContainer = ({
  tabs = [],
  defaultTab = 0,
  targetType,
  targetId,
}: PostContainerProps) => {
  // 帖子容器相关状态
  const [posts, setPosts] = useState<PostCardProps[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isError, setIsError] = useState(false);
  const [curTabIndex, setCurTabIndex] = useState((defaultTab > 0 && defaultTab < tabs.length) ? defaultTab : 0);


  // 处理刷新
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setCursor(null);
    setPosts([]);
    setIsError(false);
    setHasMore(true);
    setIsRefreshing(false);
  };

  // 处理重新加载
  const handleReload = async () => {
    setIsError(false);
    setHasMore(true);
  };

  // 处理切换标签
  const changeTab = async (index: number) => {
    if (index === curTabIndex) { return; }
    setCurTabIndex(index);
    await handleRefresh();
  };

  // 处理加载更多帖子
  const loadMore = async () => {
    if (!hasMore || isError || isRefreshing) {
      return;
    }

    try {
      const result = await new Promise<ApiResponse>((resolve, reject) => {
        setTimeout(async () => {
          try {
            // 如果有targetType和targetId，获取特定目标的帖子列表
            if (targetType && targetId) {
              let res;
              if (targetType === "user") {
                res = await postsGetPostList({cursor: cursor, pageSize: 10, userIds: [targetId]});
              } else if (targetType === "club") {
                res = await postsGetPostList({cursor: cursor, pageSize: 10, clubIds: [targetId]});
              } else {
                res = await postsGetPostList({cursor: cursor, pageSize: 10});
              }

              // to see if there are some users' information need to be cached
              let needCacheTarget: number[] = []
              res.data.data.forEach((item: PostCardProps) => {
                const userId = item.userId;
                if (!needCacheTarget.includes(userId)) {
                  needCacheTarget.push(userId);
                }
              });

              // cache users' information
              await requestSimpleUserInfoCache(needCacheTarget);
              resolve(res);
            } else {
              // 获取通用帖子列表
              let res = await postsGetPostList({cursor: cursor, pageSize: 10});

              // to see if there are some users' information need to be cached
              let needCacheTarget: number[] = []
              res.data.data.forEach((item: PostCardProps) => {
                const userId = item.userId;
                if (!needCacheTarget.includes(userId)) {
                  needCacheTarget.push(userId);
                }
              });

              // cache users' information
              await requestSimpleUserInfoCache(needCacheTarget);
              resolve(res);
            }
          } catch (err) {
            reject(err)
          }

        }, 1024);
      });

      // 加载成功
      if (result.success && !isRefreshing) {
        setCursor(result.data.cursor);
        setPosts((prev) => [...prev, ...result.data.data]);
        setHasMore(result.data.hasMore);
      }
    } catch (error) {
      setIsError(true);
      console.log(error);
      console.log("error!");
    }
  };

  // 节流，防止恶意调用
  const debounceLoadMore = debounce(loadMore, 1000);

  return (
    <div className="container">
      <div className="list">

        {tabs.length > 0 && (
          <div className="tabs">
            {tabs.map((tab, index) => (
              <span key={index} className={`tab ${index === curTabIndex ? "active" : ""}`} onClick={() => changeTab(index)}>{tab}</span>
            ))}
          </div>
        )}

        <InfiniteScroll loadMore={debounceLoadMore} hasMore={hasMore} threshold={512} loader={
          (<div key={0}> {!isError &&
            <>
              <PostCardPlaceholder />
              <PostCardPlaceholder />
            </>}
          </div>)}>
          {posts.map((post) => (
            <PostCard key={post.id} {...post}/>
          ))}
          {(!hasMore && <div style={{ textAlign: "center" }}>No more posts</div>)}
          {isError && <div style={{ textAlign: "center" }}>Error occurred, hit <button onClick={handleReload}>ME</button> to reload.</div>}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default PostContainer;