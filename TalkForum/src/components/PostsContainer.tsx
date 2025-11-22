// import "../assets/normalize.css";
import "./styles/style_postscontainer.css";
import Request from "../utils/Request";
import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroller";
import PostCard, { type PostCardProps } from "./PostCard";
import PostCardPlaceholder from "./PostCardPlaceholder";
import { DefaultAvatarUrl, DefaultBackgroundUrl } from "../constants/default";
import { usersGetSimpleUsersInfo, type SimpleUserInfo } from "../api/ApiUsers";
import { postsGetPostList } from "../api/ApiPosts";

interface PostContainerProps {
  tabs?: string[];
  defaultTab?: number;
}


interface ApiPostData {
  data: PostCardProps[];
  cursor: number;
  hasMore: boolean;
}

interface PostApiResponce {
  success: boolean;
  data: ApiPostData;
  code: number;
  message: string;
}


const PostContainer = ({
  tabs = [],
  defaultTab = 0,
}: PostContainerProps) => {
  const [posts, setPosts] = useState<PostCardProps[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [curTabIndex, setCurTabIndex] = useState((defaultTab > 0 && defaultTab < tabs.length) ? defaultTab : 0);
  const [simpleUserInfo, setSimpleUserInfo] = useState<Map<number, SimpleUserInfo>>(new Map<number, SimpleUserInfo>());


  const loadMore = async () => {
    if (!hasMore) {
      return;
    }

    try {
      const result = await new Promise<PostApiResponce>((resolve) => {
        setTimeout(async () => {
          // get next posts
          let res = await postsGetPostList(10, cursor);

          // to see if there are some users' information need to be cached
          let needCacheTarget: number[] = []
          res.data.data.forEach((item: PostCardProps) => {
            const userId = item.userId;
            if (!simpleUserInfo.has(userId) && !needCacheTarget.includes(userId)) {
              needCacheTarget.push(userId);
            }
          });

          let hereSimpleUserInfo = new Map<number, SimpleUserInfo>(simpleUserInfo);
          // cache users' information
          if (needCacheTarget.length > 0) {
            let cacheRes = await usersGetSimpleUsersInfo(needCacheTarget);
            if (cacheRes.success && cacheRes.data?.length > 0) {
              cacheRes.data.forEach((item: any) => {
                hereSimpleUserInfo.set(item.id, {
                  avatarLink: item.avatarLink,
                  name: item.name,
                });
              });
            }


          }
          // update cache
          setSimpleUserInfo(hereSimpleUserInfo);

          // update authorName and avatarLink
          let list = res.data.data;
          list.forEach((item: PostCardProps) => {
            if (hereSimpleUserInfo.has(item.userId)) {
              item.avatarLink = hereSimpleUserInfo.get(item.userId)?.avatarLink || DefaultAvatarUrl;
              item.authorName = hereSimpleUserInfo.get(item.userId)?.name || "UNKNOWN";
            } else {
              item.avatarLink = DefaultAvatarUrl;
              item.authorName = "UNKNOWN";
            }
          });

          resolve(res);
        }, 1024);
      });

      if (result.success && !isRefreshing) {
        setCursor(result.data.cursor);
        setPosts((prev) => [...prev, ...result.data.data]);
        setHasMore(result.data.hasMore);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setPosts([]);
    setHasMore(true);
    setCursor(null);
    setIsRefreshing(false);
  };

  const changeTab = async (index: number) => {
    if (index === curTabIndex) { return; }
    setCurTabIndex(index);
    await handleRefresh();
  };

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
        <InfiniteScroll loadMore={loadMore} hasMore={hasMore} threshold={512} loader={
          (<div key={0}>
            <PostCardPlaceholder />
            <PostCardPlaceholder />
          </div>)}>
          {posts.map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
          {(!hasMore && <div style={{ textAlign: "center" }}>No more posts</div>)}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default PostContainer;