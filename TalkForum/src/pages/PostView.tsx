/**
 * 帖子详情页面组件
 * 展示帖子详细内容和评论，包含：
 * - 帖子内容展示
 * - 评论列表和评论发布
 * - 帖子操作（分享、举报、编辑、删除）
 * - 回复评论功能
 * - 自动跳转到404页面（如果帖子不存在）
 */
import PostDocument from "../components/PostDocument";
import ReportDialog from "../components/ReportDialog";
import PostDialog from "../components/PostDialog";
import { createPortal } from "react-dom";
import BackgroundImg from "../components/BackgroundImg";
import "./styles/style_postview.css"
import { DefaultBackgroundUrl, PostViewType } from "../constants/default";
import { useEffect, useState, useRef, useCallback, type JSX } from "react";
import { debounce } from "../utils/debounce&throttle";
import { postsDeletePostAuth, postsGetPostDetailInformation } from "../api/ApiPosts";
import { parseMarkdown, type TocNode } from "../utils/MarkdownUtil";
import { type PostType } from "../api/ApiPosts";
import { ArrowLeftIcon, EllipsisHorizontalIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { useSelector } from "react-redux";
import { commentPostComment } from "../api/ApiComments";
import Msg from "../utils/msg";
import { getSingleSimpleUserInfo } from "../utils/simpleUserInfoCache";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { copyToClipboard } from "../utils/clipboard";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import NotFound from "./NotFound";


/**
 * 评论目标接口
 * 定义评论回复的目标信息
 */
export interface CommentTarget {
  parentId: number | null;  // 父评论ID
  rootId: number | null;    // 根评论ID
  userId: number | null;    // 回复的用户ID
  commentToContent: string; // 回复的评论内容
}

/**
 * 评论目标回调类型
 * 用于设置评论回复目标的回调函数
 */
export type CommentTargetCallback = (target: CommentTarget) => void;


/**
 * 帖子详情页面组件
 * 展示帖子详细内容和评论
 */
const PostView = () => {
  // 从URL参数中获取帖子ID
  const { postId } = useParams<{ postId: string }>();
  // 路由导航钩子
  const navigate = useNavigate();
  // 获取当前路由位置
  const location = useLocation();
  // 帖子是否存在的状态
  const [ok, setOk] = useState(true);
  // 渲染的帖子内容（Markdown转换后的HTML）
  const [renderContent, setRenderContent] = useState<string>("");
  // 从Redux获取用户登录状态
  const { isLoggedIn } = useSelector((state: any) => state.user);
  // 评论回复目标状态
  const [commentTarget, setCommentTarget] = useState<CommentTarget>({ parentId: null, rootId: null, userId: null, commentToContent: "" });
  // 是否显示编辑帖子对话框
  const [showPostDialog, setShowPostDialog] = useState(false);
  // 是否显示举报帖子对话框
  const [showReportDialog, setShowReportDialog] = useState(false);
  // 帖子数据状态
  const [post, setPost] = useState<PostType>({
    id: postId ? parseInt(postId) : 0,
    title: "",
    content: "",
    userId: 0,
    clubId: null,
    status: 0,
    isEssence: 0,
    createdAt: "",
    updatedAt: "",
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    interactContent: 0,
  });

  // 目录数据状态
  const [tocNodeTree, setTocNodeTree] = useState<TocNode[]>([]);
  // 目录显示状态（小屏幕下）
  const [showTocMenu, setShowTocMenu] = useState(false);

  // 评论内容输入框的引用
  const commentContentRef = useRef<HTMLTextAreaElement>(null);

  /**
   * 发送评论的处理函数
   * - 验证评论内容是否为空
   * - 调用API发布评论
   * - 处理评论发布结果
   */
  const handleCommentSend = useCallback(debounce(async () => {
    if (commentContentRef.current) {
      let content = commentContentRef.current.value.trim();
      if (content === "") {
        Msg.error("Comment content cannot be empty!");
        return;
      }

      await commentPostComment(post.id, content, commentTarget.rootId, commentTarget.parentId).then(res => {
        if (res.success) {
          Msg.success(res.message);
          commentContentRef.current!.value = "";
          setCommentTarget({ parentId: null, rootId: null, userId: null, commentToContent: "" });
        } else {
          throw new Error(res.message);
        }
      }).catch(err => {
        Msg.error(err.message);
        console.log(err);
      })
    }
  }, 500), [post.id, commentTarget.parentId, commentTarget.rootId]); // 500ms的防抖延迟，防止多次点击发送

  /**
   * 加载帖子详情的函数
   * - 使用useCallback包装，避免不必要的重定义
   * - 调用API获取帖子详情
   * - 解析Markdown内容为HTML
   * - 设置帖子数据状态
   * - 解析目录结构
   */
  const loadPostDetail = useCallback(debounce(async (postId: string) => {
    if (postId) {
      const postIdNum = Number(postId);
      await postsGetPostDetailInformation(postIdNum).then(async res => {
        if (res.success) {
          const post_result: PostType = res.data;
          console.log(post_result);
          setPost({ ...post_result });

          const { html, tocNodeTree } = await parseMarkdown(post_result.content);
          setRenderContent(html);
          setTocNodeTree(tocNodeTree); // 设置目录树数据
          setOk(true); // 帖子存在，显示帖子内容
        } else {
          throw new Error(res.message);
        }
      }).catch(err => {
        console.log(err);
        setOk(false); // 加载失败，显示404
      });
    } else {
      setOk(false); // 帖子不存在，显示404
    }
  }, 300), []); // 300ms的防抖延迟

  /**
   * 组件挂载或postId变化时加载帖子详情
   */
  useEffect(() => {
    loadPostDetail(postId!);
    // 检测URL中的参数，如果存在则自动打开对应的对话框
    const params = new URLSearchParams(location.search);
    let hasParamToRemove = false;
    
    if (params.get('report') === 'true') {
      setShowReportDialog(true);
      // 移除URL中的report参数，避免刷新页面时再次触发
      params.delete('report');
      hasParamToRemove = true;
    }
    if (params.get('edit') === 'true') {
      setShowPostDialog(true);
      // 移除URL中的edit参数，避免刷新页面时再次触发
      params.delete('edit');
      hasParamToRemove = true;
    }
    // 如果有参数被移除，更新URL
    // 使用replace: true来替换当前历史记录条目，避免回退时再次触发
    if (hasParamToRemove) {
      navigate({ search: params.toString() }, { replace: true });
    }
  }, [postId, loadPostDetail, location.search, navigate]);

  /**
   * 渲染目录树的递归函数
   * @param nodes 目录节点数组
   * @returns 渲染后的目录结构
   */
  const renderTocTree = (nodes: TocNode[]): JSX.Element => {
    return (
      <ul className="toc-list">
        {nodes.map((node, index) => (
          <li key={`${node.id}-${index}`} className={`toc-item level-${node.level}`}>
            <a 
              href={`#${node.id}`} 
              className="toc-link"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById(node.id);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                  setShowTocMenu(false); // 点击目录项后关闭菜单
                }
              }}
            >
              {node.name}
            </a>
            {node.children.length > 0 && renderTocTree(node.children)}
          </li>
        ))}
      </ul>
    );
  };

  /**
   * 返回上一页的处理函数
   */
  const handleClose = () => {
    navigate(-1); // 返回上一页
  };

  return (
    ok ? 
    (<div className="post-view-cover">
      <div className="title">
        Post Detail
        <ArrowLeftIcon onClick={handleClose} />

        <EllipsisHorizontalIcon onClick={async () => {
          const menus = [
            "Share Post",
            "Report post",
            "Edit post",
            "Delete post",
          ]
          
          await Msg.menu(menus, "What do you want to do with this post?").then(async res => {
            switch (res) {
            case 0:
              Msg.success("Already copy the link to clipboard! send to your friends to share!");
              copyToClipboard(`${window.location.origin}/post/${postId}`);
              break;
            case 1:
              setShowReportDialog(true);
              break;
            case 2:
              setShowPostDialog(true);
              break;
            case 3:
              Msg.confirm("Are you sure to delete this post?").then(async res => {
                if (res) {
                  await postsDeletePostAuth(post.id).then(res => {
                    if (res.success) {
                      Msg.success(res.message);
                      handleClose();
                    } else {
                      Msg.error(res.message);
                    }
                  }).catch(err => {
                    Msg.error(err.message);
                    console.log(err);
                  })
                }
              });
              break;
            }
          })
        }} >
        </EllipsisHorizontalIcon>
      </div>
      <BackgroundImg src={DefaultBackgroundUrl}/>
      
      {/* 目录结构 - 桌面端 */}
      {tocNodeTree.length > 0 && (
        <div className="toc-desktop">
          <h3 className="toc-title">Contents</h3>
          {renderTocTree(tocNodeTree)}
        </div>
      )}
      
      {/* 目录按钮 - 移动端 */}
      {tocNodeTree.length > 0 && (
        <button 
          className="toc-mobile-button"
          onClick={() => setShowTocMenu(!showTocMenu)}
        >
          <ChevronRightIcon />
          Contents
        </button>
      )}
      
      {/* 目录菜单 - 移动端 */}
      {showTocMenu && tocNodeTree.length > 0 && (
        <div className="toc-mobile-menu">
          <div className="toc-mobile-header">
            <h3 className="toc-title">Contents</h3>
            <XMarkIcon 
              className="toc-mobile-close"
              onClick={() => setShowTocMenu(false)}
            />
          </div>
          <div className="toc-mobile-content">
            {renderTocTree(tocNodeTree)}
          </div>
        </div>
      )}
      
      <PostDocument {...post} renderContent={renderContent} setCommentTarget={setCommentTarget} />
      <div className="comment-input">
        {
          commentTarget.parentId && commentTarget.userId && (

            <div className="comment-reply-show">
              <p>
                <span>
                  Reply to {getSingleSimpleUserInfo(commentTarget.userId).name}: </span>
                {commentTarget.commentToContent}
              </p>
              <XMarkIcon onClick={() => {
                setCommentTarget({ parentId: null, rootId: null, userId: null, commentToContent: "" });
              }} />
            </div>
          )
        }
        <textarea placeholder={isLoggedIn ? "Leave a comment" : "Please login to leave a comment"} ref={commentContentRef}></textarea>
        <button onClick={handleCommentSend}>Send</button>
      </div>

      {showPostDialog && createPortal(
        <PostDialog notification="Edit post" title={post.title} content={post.content} postId={post.id} onClose={() => setShowPostDialog(false)} />,
        document.body
      )}
      {showReportDialog && createPortal(
        <ReportDialog onClose={() => setShowReportDialog(false)} reportId={post.id} />,
        document.body)}
    </div>) : <NotFound />
  );
};

export default PostView;
