import "./styles/style_postdocument.css";
import { type PostType } from "../api/ApiPosts";
import CommentItem from "./CommentItem";
import dayjs from "dayjs";
import { ArrowPathIcon } from "@heroicons/react/20/solid";
import InfiniteScroll from "react-infinite-scroller";
import { useState, useCallback, useEffect, useRef } from "react";
import { getSingleSimpleUserInfo, requestSimpleUserInfoCache } from "../utils/simpleUserInfoCache";
import { throttle } from "../utils/debounce&throttle";
import { type CommentItemProps } from "./CommentItem";
import { commentGetCommentList, type Comment } from "../api/ApiComments";
import { type CommentTargetCallback } from "../pages/PostView";
import { useNavigate, useLocation } from "react-router-dom";
import { DefaultAvatarUrl, SpaceViewType } from "../constants/default";
import Msg from "../utils/msg";
import { HandThumbUpIcon, HandThumbDownIcon } from "@heroicons/react/24/solid";
import { useSelector } from "react-redux";
import { type RootState } from "../store";
import { interactionMakeInteractionWithPost } from "../api/ApiInteractions";
import { INTERACT_POST } from "../api/ApiInteractions";

export interface PostDocumentProps extends PostType {
  renderContent: string;
  setCommentTarget: CommentTargetCallback;
}

const PostDocument = (props: PostDocumentProps) => {
  const {
    content, renderContent, title, userId, clubId, status,
    isEssence, createdAt, updatedAt, viewCount, likeCount,
    commentCount, id, setCommentTarget, interactContent
  } = props;

  // 路由导航钩子
  const navigate = useNavigate();
  // 当前路由信息钩子
  const location = useLocation();

  // 当前点赞数的状态
  const [curLikeCount, setCurLikeCount] = useState(likeCount);

  // 当前是否点赞的状态
  const [isLiked, setIsLiked] = useState(interactContent === INTERACT_POST.LIKE);
  
  // 当前是否踩的状态
  const [isDisliked, setIsDisliked] = useState(interactContent === INTERACT_POST.DISLIKE);

  // 当interactContent变化时，更新点赞/踩状态
  useEffect(() => {
    setIsLiked(interactContent === INTERACT_POST.LIKE);
    setIsDisliked(interactContent === INTERACT_POST.DISLIKE);
  }, [interactContent]);
  
  // 当likeCount变化时，更新点赞数状态
  useEffect(() => {
    setCurLikeCount(likeCount);
  }, [likeCount]);

  // 从Redux获取用户信息
  const user = useSelector((state: RootState) => state.user);

  // 评论相关状态
  const [comments, setComments] = useState<CommentItemProps[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isError, setIsError] = useState(false);

  // API请求锁状态，防止并发请求
  const [isLoading, setIsLoading] = useState(false);
  // 使用ref跟踪加载状态，避免闭包问题
  const isLoadingRef = useRef(false);
  // 用户信息加载状态
  const [isUserInfoLoading, setIsUserInfoLoading] = useState(true);

  // 请求缓存用户信息，替换立即执行函数
  useEffect(() => {
    const loadUserInfo = async () => {
      setIsUserInfoLoading(true);
      try {
        await requestSimpleUserInfoCache([userId]);
      } catch (error) {
        console.error("Failed to load user info cache:", error);
      } finally {
        setIsUserInfoLoading(false);
      }
    };
    loadUserInfo();
  }, [userId]);

  // 处理评论刷新
  const handleRefresh = () => {
    // 如果API请求已在进行中，则不执行刷新操作
    if (isLoadingRef.current) {
      return;
    }

    setIsRefreshing(true);
    setIsError(false);
    setCursor(null);
    setComments([]);
    setHasMore(true);
    // 重置初始加载标记，允许重新加载
    hasInitialLoaded.current = false;
  };


  // 处理评论重新加载
  const handleReload = async () => {
    // 如果API请求已在进行中，则不执行重新加载操作
    if (isLoadingRef.current) {
      return;
    }

    setIsError(false);
    setHasMore(true);
    // 重置初始加载标记，允许重新加载
    hasInitialLoaded.current = false;
    await loadMore();
  };

  // 加载更多评论
  const loadMore = useCallback(async () => {
    // 如果API请求已在进行中，则不执行加载操作
    if (isLoadingRef.current) {
      // console.log("loadMore - already loading, skipping");
      return;
    }

    // 允许在刷新时加载，即使hasMore为false
    if (isError && !isRefreshing) {
      // console.log("loadMore - error state and not refreshing, skipping");
      return;
    }

    // 如果没有更多数据且不是刷新状态，则直接返回
    if (!hasMore && !isRefreshing) {
      // console.log("loadMore - no more data and not refreshing, skipping");
      return;
    }

    try {
      // 设置API请求锁为true（使用ref立即更新）
      isLoadingRef.current = true;
      setIsLoading(true);

      // console.log("loadMore f - starting API request");
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

      if (res.success) {
        setCursor(res.data.cursor);
        // 打印从API获取的评论数据
        console.log("API returned comments:", res.data.data.map(c => ({ id: c.id, interactContent: c.interactContent })));
        
        // 如果是刷新状态，替换评论列表，否则追加
      if (isRefreshing) {
        // 刷新时，创建新的评论数组，确保React能正确更新组件
        // 保留原有评论的interactContent属性
        const newComments = res.data.data.map(item => {
          // 查找原有评论中是否有相同的评论
          const existingComment = comments.find(c => c.id === item.id);
          return {
            ...item,
            setCommentTarget,
            // 如果存在原有评论，保留其interactContent属性
            interactContent: existingComment ? existingComment.interactContent : item.interactContent
          };
        });
        console.log("Refreshed comments with interactContent:", newComments.map(c => ({ id: c.id, interactContent: c.interactContent })));
        setComments(newComments);
      } else {
        // 追加评论时，保持原有评论不变，只添加新评论
        const newComments = res.data.data.map(item => ({
          ...item,
          setCommentTarget
        }));
        setComments(prev => {
          // 保留原有评论的interactContent属性
          const updatedComments = [...prev];
          newComments.forEach(newComment => {
            const existingCommentIndex = updatedComments.findIndex(c => c.id === newComment.id);
            if (existingCommentIndex === -1) {
              // 新评论，直接添加
              updatedComments.push(newComment);
            } else {
              // 已存在的评论，保留其interactContent属性
              updatedComments[existingCommentIndex] = {
                ...newComment,
                interactContent: updatedComments[existingCommentIndex].interactContent
              };
            }
          });
          console.log("Updated comments with interactContent:", updatedComments.map(c => ({ id: c.id, interactContent: c.interactContent })));
          return updatedComments;
        });
      }
        setHasMore(res.data.hasMore);
        // console.log("loadMore - success, hasMore:", res.data.hasMore);
      }
    } catch (error) {
      setIsError(true);
      console.error("Failed to load comments:", error);
    } finally {
      // 无论请求成功还是失败，都释放API请求锁
      isLoadingRef.current = false;
      setIsLoading(false);
      // console.log("loadMore e - finished, lock released");
    }
  }, [id, cursor, hasMore, isError, isRefreshing]);

  // 使用节流函数限制加载频率，但缩短延迟时间以提高响应速度
  const throttleLoadMore = useRef(throttle(loadMore, 500)).current;

  // 使用useRef来跟踪是否已经执行过初始加载，解决React StrictMode下重复加载的问题
  const hasInitialLoaded = useRef(false);

  // 重置状态，确保每次组件更新时都能重新初始化
  useEffect(() => {
    setCursor(null);
    setComments([]);
    setIsError(false);
    setHasMore(true);
    hasInitialLoaded.current = false;
  }, [id]);

  // 初始加载评论
  useEffect(() => {
    // 如果已经加载过初始数据、正在刷新或API请求已在进行中，则直接返回
    if (hasInitialLoaded.current || isRefreshing || isLoadingRef.current) {
      console.log("Initial load skipped - already loaded, refreshing, or loading");
      return;
    }

    // 标记已经执行过初始加载
    hasInitialLoaded.current = true;

    // 组件挂载时直接调用loadMore
    console.log("Initial load - calling loadMore");
    loadMore();
  }, []); // 只在组件首次挂载时执行，不在id变化时执行

  // 监听刷新状态变化，触发加载
  useEffect(() => {
    if (isRefreshing) {
      const refreshComments = async () => {
        console.log("Refresh triggered - calling loadMore");
        await loadMore();
        setIsRefreshing(false);
      };
      refreshComments();
    }
  }, [isRefreshing, loadMore]);

  /**
   * 处理评论互动状态变化
   * @param {number} commentId - 评论ID
   * @param {number} newInteractContent - 新的互动内容
   * @param {number} newLikeCount - 新的点赞数
   */
  const handleCommentInteractionChange = (commentId: number, newInteractContent: number, newLikeCount: number) => {
    // 更新评论列表中对应评论的互动状态和点赞数
    setComments(prevComments => 
      prevComments.map(comment => 
        comment.id === commentId 
          ? { ...comment, interactContent: newInteractContent, likeCount: newLikeCount }
          : comment
      )
    );
  };

  /**
   * 处理点赞操作
   * @param {number} id - 帖子ID
   */
  const handleLike = async (id: number) => {
    // 检查用户是否登录
    if (!user.isLoggedIn) {
      Msg.error("Please login first!");
      return;
    }

    // 确定互动内容：如果已点赞则取消点赞，否则点赞
    const targetInteractContent = isLiked ? INTERACT_POST.NONE : INTERACT_POST.LIKE;

    // 调用互动API
    await interactionMakeInteractionWithPost(id, targetInteractContent).then(res => {
      if (res.success) {
        // 更新本地状态
        if (isLiked) {
          // 取消点赞
          setIsLiked(false);
          setCurLikeCount(curLikeCount - 1);
        } else {
          // 点赞
          setIsLiked(true);
          setCurLikeCount(curLikeCount + 1);
          
          // 如果之前是踩的状态，需要重置
          if (isDisliked) {
            setIsDisliked(false);
            // 如果之前是踩，现在改为点赞，需要增加2个点赞数（因为踩时减少了1个点赞数）
            setCurLikeCount(prev => prev + 1);
          }
        }
      } else {
        throw new Error(res.message);
      }
    }).catch(err => {
      Msg.error(err.message);
    })
  };
  
  /**
   * 处理踩操作
   * @param {number} id - 帖子ID
   */
  const handleDislike = async (id: number) => {
    // 检查用户是否登录
    if (!user.isLoggedIn) {
      Msg.error("Please login first!");
      return;
    }

    // 确定互动内容：如果已踩则取消踩，否则踩
    const targetInteractContent = isDisliked ? INTERACT_POST.NONE : INTERACT_POST.DISLIKE;

    // 调用互动API
    await interactionMakeInteractionWithPost(id, targetInteractContent).then(res => {
      if (res.success) {
        // 更新本地状态
        if (isDisliked) {
          // 取消踩
          setIsDisliked(false);
          setCurLikeCount(curLikeCount + 1);
        } else {
          // 踩
          setIsDisliked(true);
          setCurLikeCount(curLikeCount - 1);
          
          // 如果之前是点赞的状态，需要重置
          if (isLiked) {
            setIsLiked(false);
            // 如果之前是点赞，现在改为踩，需要减少2个点赞数（因为点赞时增加了1个点赞数）
            setCurLikeCount(prev => prev - 1);
          }
        }
      } else {
        throw new Error(res.message);
      }
    }).catch(err => {
      Msg.error(err.message);
    })
  };

  /**
   * 打开用户空间
   * @param {number} userId - 用户ID
   */
  const openSpaceView = (userId: number) => {
    // 获取当前路由路径
    const currentPath = location.pathname;
    // 解析当前路由的类型和ID
    const pathSegments = currentPath.split('/').filter(segment => segment !== '');

    // 判断是否已经在目标页面
    if (pathSegments.length >= 2 && pathSegments[0] === SpaceViewType.USER && parseInt(pathSegments[1]) === userId) {
      // 如果已经在目标页面，则不执行跳转
      return;
    }

    // 否则，执行正常的跳转
    navigate(`/${SpaceViewType.USER}/${userId}`);
  }

  return (
    <div className="post-document">
      <div className="post-window">
        <div className="post-header">
          <h1 className="post-title">{title}</h1>
          <div className="author-info">
            <img
              src={isUserInfoLoading ? DefaultAvatarUrl : getSingleSimpleUserInfo(userId).avatarLink}
              alt="Avatar"
              onClick={() => openSpaceView(userId)}
              className={isUserInfoLoading ? "loading" : ""}
            />
            <div className="author-combo">
              <span className="author-name">
                {isUserInfoLoading ? "Loading..." : getSingleSimpleUserInfo(userId).name}
              </span>
              <span className="post-date">
                {(isEssence != 0) && <span className="badge">Essence</span>}
                Last Edited at {dayjs(updatedAt).format("HH:mm:ss MM DD, YYYY")}
              </span>
            </div>
          </div>
        </div>
        <div className="post-content" dangerouslySetInnerHTML={{ __html: renderContent }}></div>

        {/* 帖子互动区域 */}
        <div className="post-interaction">
          <div onClick={() => handleLike(id)}>
            <p>Like</p>
            <HandThumbUpIcon className={isLiked ? "liked" : ""}></HandThumbUpIcon>
            <span>{curLikeCount}</span>
          </div>
          <div onClick={() => handleDislike(id)}>
            <p>Dislike</p>
            <HandThumbDownIcon className={isDisliked ? "disliked" : ""}></HandThumbDownIcon>
          </div>
        </div>
        <div className="post-comment">
          <h2>
            <div>Comments ({commentCount}) </div>
            <button className="refresh-button" onClick={handleRefresh} disabled={isRefreshing}>
              {isRefreshing ? <ArrowPathIcon className="animate-spin" /> : <ArrowPathIcon />}
            </button>
          </h2>

          <div>
            <InfiniteScroll
              initialLoad={false}
              loadMore={throttleLoadMore}
              hasMore={hasMore}
              threshold={100}
              loader={(
                <div key="loading" style={{ textAlign: "center" }}>
                  {!isError && "Loading Comments..."}
                </div>
              )}
            >
              {/* 刷新指示器 */}
              {isRefreshing && (
                <div style={{ textAlign: "center", padding: "10px", color: "var(--neutral-text-secondary)" }}>
                  Refreshing...
                </div>
              )}

              {comments.map(comment => (
                <CommentItem 
                  key={comment.id} 
                  {...comment} 
                  setCommentTarget={setCommentTarget} 
                  onInteractionChange={handleCommentInteractionChange}
                />
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
    </div>
  );
};

export default PostDocument;