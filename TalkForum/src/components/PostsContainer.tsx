// import "../assets/normalize.css";
import "./styles/style_postscontainer.css";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroller";
import PostCard, { type PostCardProps } from "./PostCard";
import PostCardPlaceholder from "./PostCardPlaceholder";
import PostView from "./PostView";
import { postsDeletePostAuth, postsGetPostList } from "../api/ApiPosts";
import { debounce } from "../utils/debounce&throttle";
import SpaceView from "./SpaceView";
import { createPortal } from "react-dom";
import { requestSimpleUserInfoCache } from "../utils/simpleUserInfoCache";
import type ApiResponse from "../api/ApiResponse";
import Msg from "../utils/msg";
import ReportDialog from "./ReportDialog";
import { PostViewType } from "../constants/default";


interface PostContainerProps {
  tabs?: string[];
  defaultTab?: number;
}



const PostContainer = ({
  tabs = [],
  defaultTab = 0,
}: PostContainerProps) => {
  // 帖子容器相关状态
  const [posts, setPosts] = useState<PostCardProps[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isError, setIsError] = useState(false);

  const [curTabIndex, setCurTabIndex] = useState((defaultTab > 0 && defaultTab < tabs.length) ? defaultTab : 0);

  // 展示对话框相关状态
  const [showPostView, setShowPostView] = useState<boolean>(false);
  const [showSpaceView, setShowSpaceView] = useState<boolean>(false);
  const [showReportDialog, setShowReportDialog] = useState<boolean>(false);
  const [curPostId, setCurPostId] = useState<number>(0);
  const [target, setTarget] = useState<string>(PostViewType.CONTENT);

  // 监听参数
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const postIdStr = searchParams.get("postId");
    const clubIdStr = searchParams.get("clubId");
    const userIdStr = searchParams.get("userId");
    if (postIdStr) {
      const postId = parseInt(postIdStr);
      setCurPostId(postId);
      setShowPostView(true);
    } else if (clubIdStr) {

    } else if (userIdStr) {
    } else {
      setShowPostView(false);
      setShowSpaceView(false);
    }
  }, [searchParams]);


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

  // 处理打开帖子（看内容/评论/修改）
  const openPostView = (postId: number, target: string) => {
    setTarget(target);
    setSearchParams({ postId: postId.toString() }, { replace: true });
  }

  // 处理关闭帖子
  const closePostView = () => {
    setSearchParams({}, { replace: true });
  }

  // 处理打开用户的空间或者圈子空间
  const openSpace = (id: number, target: string) => {

  }

  // 处理删帖
  const deletePost = async (postId: number) => {
    const sure = await Msg.confirm("Are you sure to delete this post?");
    if (sure) {
      await postsDeletePostAuth(postId).then((res) => {
        if (res.success) {
          Msg.success("Post deleted successfully!");
          setPosts(posts.filter((post) => post.id !== postId));
        } else {
          throw new Error(res.message);
        }
      }).catch(err => {
        Msg.error(err.message);
      });
    }
  }

  // 处理举报帖子
  const reportPost = (postId: number) => {
    setShowReportDialog(true);
  }

  // 处理加载更多帖子
  const loadMore = async () => {
    if (!hasMore || isError || isRefreshing) {
      return;
    }

    try {
      const result = await new Promise<ApiResponse>((resolve, reject) => {
        setTimeout(async () => {
          try {
            // get next posts
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
            <PostCard key={post.id} {...post}
              openPostView={openPostView}
              openSpaceView={openSpace}
              deletePost={deletePost}
              reportPost={reportPost}
            />
          ))}
          {(!hasMore && <div style={{ textAlign: "center" }}>No more posts</div>)}
          {isError && <div style={{ textAlign: "center" }}>Error occurred, hit <button onClick={handleReload}>ME</button> to reload.</div>}
        </InfiniteScroll>

        {showPostView && createPortal(
          <PostView postId={curPostId} onClose={closePostView} target={target}/>,
          document.body
        )}
        {showSpaceView && createPortal(
          <SpaceView onClose={() => setShowSpaceView(false)} />,
          document.body
        )}
        {showReportDialog && createPortal(
          <ReportDialog onClose={() => setShowReportDialog(false)} reportId={curPostId}/>,
          document.body
        )}
      </div>
    </div>
  );
};

export default PostContainer;