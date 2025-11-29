import "./styles/style_postdocument.css"
import { type PostType } from "../api/ApiPosts";
import CommentItem from "./CommentItem";
import dayjs from "dayjs";
import { ArrowPathIcon } from "@heroicons/react/20/solid";
import InfiniteScroll from "react-infinite-scroller";
import { useState, useCallback, use } from "react";
import { getSingleSimpleUserInfo, requestSimpleUserInfoCache } from "../utils/simpleUserInfoCache";
import { debounce } from "../utils/debounce&throttle";
import type ApiResponse from "../api/ApiResponse";
import { type CommentItemProps } from "./CommentItem";
import { commentGetCommentList, type Comment } from "../api/ApiComment";
import { type CommentTargetCallback } from "./PostView";

export interface PostDocumentProps extends PostType {
  renderContent: string;
  setCommentTarget: CommentTargetCallback;
}

const PostDocument = (props: PostDocumentProps) => {
  const {
    content, renderContent, title, userId, clubId, status,
    isEssence, createdAt, updatedAt, viewCount, likeCount,
    commentCount, id, setCommentTarget
  } = props;

  // 评论相关状态
  const [comments, setComments] = useState<CommentItemProps[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isError, setIsError] = useState(false);

    // 处理评论刷新
  const handleRefresh = async () => {
    
    setIsRefreshing(true);
    setIsError(false);
    setCursor(null);
    setComments([]);
    setIsError(false);
    setHasMore(true);
    setIsRefreshing(false);
  };

  // 处理评论重新加载
  const handleReload = async () => {
    setIsError(false);
    setHasMore(true);
  };

  // 加载更多评论
  const loadMore = async () => {
    // allow when `isRefreshing` is true because refresh flow intentionally triggers load
    if (!hasMore || isError) {
      return;
    }
    try {
    console.log("loadMore f");
      const result = await new Promise<ApiResponse>((resolve, reject) => {
        setTimeout(async () => {
          try {
            const res = await commentGetCommentList(id, cursor, 10);

            // 收集需要缓存的用户ID
            const needCacheTarget: number[] = [];
            res.data.data.forEach((item: Comment) => {
              const commentUserId = item.userId;
              if (!needCacheTarget.includes(commentUserId)) {
                needCacheTarget.push(commentUserId);
              }
            });

            // 缓存用户信息
            await requestSimpleUserInfoCache(needCacheTarget);

            resolve(res);
          } catch (err) {
            reject(err);
          }
        }, 1200);
      });

      if (result.success) {
        setCursor(result.data.cursor);
        setComments(prev => [...prev, ...result.data.data]);
        setHasMore(result.data.hasMore);
      }
    } catch (error) {
      setIsError(true);
      console.error("Failed to load comments:", error);
    }
    
    console.log("loadMore e");
  };

  const debounceLoadMore = useCallback(
      debounce(loadMore, 400)
  ,[cursor, hasMore, isError]);

  return (
    <div className="post-document">
      <div className="post-window">
        <div className="post-header">
          <h1 className="post-title">{title}</h1>
          <div className="author-info">
            <img src={getSingleSimpleUserInfo(userId).avatarLink} alt="Avatar" />
            <div className="author-combo">
              <span className="author-name">{getSingleSimpleUserInfo(userId).name}</span>
              <span className="post-date">
                {(isEssence !== 0) && <span className="badge">Essence</span>}
                Last Edited at {dayjs(updatedAt).format("HH:mm:ss MM DD, YYYY")}
              </span>
            </div>
          </div>
        </div>
        <div className="post-content" dangerouslySetInnerHTML={{ __html: renderContent }}></div>
        <div className="post-comment">
          <h2>
            <div>Comments ({commentCount}) </div>
            <button className="refresh-button" onClick={handleRefresh}> <ArrowPathIcon /> </button>
          </h2>

          <InfiniteScroll
            loadMore={debounceLoadMore}
            hasMore={hasMore}
            threshold={100}
            loader={(
              <div key="loading" style={{textAlign: "center"}}>
                {!isError && "Loading Comments..."}
              </div>
            )}
          >
            {comments.map(comment => (
              <CommentItem key={comment.id} {...comment} setCommentTarget={setCommentTarget}/>
            ))}
            
            {!hasMore && (
              <div style={{ textAlign: "center" }}>
                No more comments!
              </div>
            )}
            {isError && (
              <div style={{ textAlign: "center" }}>
                Error loading comments, <button onClick={handleReload}>retry</button>
              </div>
            )}
          </InfiniteScroll>
        </div>
      </div>
    </div>
  );
};

export default PostDocument;