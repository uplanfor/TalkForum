// import "../assets/normalize.css";
import "./styles/style_postscontainer.css";
import Request from "../utils/Request";
import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroller";
import PostCard, { type PostCardProps } from "./PostCard";
import PostCardPlaceholder from "./PostCardPlaceholder";
import { DefaultAvatarUrl, DefaultBackgroundUrl } from "../constants/default";

interface PostContainerProps {
  tabs?: string[];
  defaultTab?: number;
}

const PostContainer = ({
  tabs = [],
  defaultTab = 0,
}: PostContainerProps) => {
  const [posts, setPosts] = useState<PostCardProps[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [curTabIndex, setCurTabIndex] = useState((defaultTab > 0 && defaultTab < tabs.length) ? defaultTab : 0);

  const mocApi = (resolve: Function, reject: Function) => {
    setTimeout(() => {
      const data = [];
      for (let i = 0; i < 10; i++) {
        const a = page * 10 - 9 + i;
        data.push({
          avatarLink: DefaultAvatarUrl,
          title: `Post Title ${i + 1}`,
          brief: `Post Brief ${i + 1}`,
          coverLink: a % 3 === 0 ? DefaultBackgroundUrl : null,
          authorId: 1,
          authorName: `Author Name ${a}`,
          postId: a,
          clubId: 1,
          viewCount: 100,
          likeCount: 10,
          commentCount: 10,
        });
      }
      resolve({
        data,
        hasMore: true,
      });
    }, 1000);
  }

  const loadMore = async () => {
    if (!hasMore) {
      return;
    }

    const result = await new Promise<{ data: PostCardProps[]; hasMore: boolean }>(mocApi);
    setPage((prev) => prev + 1);
    setPosts((prev) => [...prev, ...result.data]);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setPosts([]);
    setHasMore(true);
    setPage(1);
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
        <InfiniteScroll loadMore={loadMore} hasMore={hasMore} loader={
            (<div key={0}>
              <PostCardPlaceholder/>
              <PostCardPlaceholder/>
              <PostCardPlaceholder/>
            </div>)}>
          {posts.map((post) => (
            <PostCard key={post.postId} {...post} />
          ))}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default PostContainer;