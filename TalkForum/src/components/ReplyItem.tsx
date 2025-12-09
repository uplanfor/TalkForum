/**
 * 回复项组件
 * 用于展示单个回复及其点赞/踩功能
 */
import "./styles/style_commentitem.css"
import { type Comment } from "../api/ApiComments";
import { getSingleSimpleUserInfo } from "../utils/simpleUserInfoCache";
import dayjs from "dayjs";
import { type CommentTargetCallback } from "../pages/PostView";
import { HandThumbUpIcon, HandThumbDownIcon } from "@heroicons/react/24/solid";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { useState, useEffect, useCallback } from "react";
import { interactionMakeInteractionWithComment, INTERACT_COMMENT } from "../api/ApiInteractions";
import { commentDeleteComment } from "../api/ApiComments";
import { useSelector } from "react-redux";
import { type RootState } from "../store";
import { UserRoleEnum } from "../constants/user_constant";
import { ReportTargetConstant } from "../constants/report_constant";
import  Msg  from "../utils/msg";
import { copyToClipboard } from "../utils/clipboard";
import ReportDialog from "./ReportDialog";
import { useNavigate, useLocation } from "react-router-dom";
import { SpaceViewType } from "../constants/default";
import { createPortal } from "react-dom";

/**
 * 回复项组件属性接口
 * 继承自Comment接口，并添加了设置评论目标的回调函数
 */
export interface ReplyItemProps extends Comment {
    setCommentTarget: CommentTargetCallback; // 设置评论目标的回调函数，用于回复评论
    rootId: number; // 根评论ID
    onInteractionChange?: (commentId: number, newInteractContent: number, newLikeCount: number) => void; // 互动状态变化回调
    onCommentDelete?: (commentId: number) => void; // 评论删除回调
}

/**
 * 回复项组件
 * @param {ReplyItemProps} props - 组件属性
 */
const ReplyItem = ({ content, createdAt, userId, setCommentTarget, id, likeCount, interactContent, rootId, onInteractionChange, onCommentDelete }: ReplyItemProps) => {
    // 路由导航钩子
    const navigate = useNavigate();
    // 当前路由信息钩子
    const location = useLocation();
    // 获取用户状态
    const user = useSelector((state: RootState) => state.user);
    
    // 当前点赞数的状态
    const [curLikeCount, setCurLikeCount] = useState(likeCount);
    
    // 当前是否点赞的状态
    const [isLiked, setIsLiked] = useState(interactContent === INTERACT_COMMENT.LIKE);
    
    // 当前是否踩的状态
    const [isDisliked, setIsDisliked] = useState(interactContent === INTERACT_COMMENT.DISLIKE);
    
    // 举报对话框显示状态
    const [showReportDialog, setShowReportDialog] = useState(false);

    // 当interactContent变化时，更新点赞/踩状态
    useEffect(() => {
        setIsLiked(interactContent === INTERACT_COMMENT.LIKE);
        setIsDisliked(interactContent === INTERACT_COMMENT.DISLIKE);
    }, [interactContent]);
    
    // 当likeCount变化时，更新点赞数状态
    useEffect(() => {
        setCurLikeCount(likeCount);
    }, [likeCount]);

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

    /**
     * 处理点赞操作
     * @param {number} id - 回复ID
     */
    const handleLike = async (id: number) => {
        try {
            // 确定互动内容
            let newInteractContent;
            if (isLiked) {
                // 已经点赞，点击后取消点赞
                newInteractContent = INTERACT_COMMENT.NONE;
            } else {
                // 未点赞，点击后点赞
                newInteractContent = INTERACT_COMMENT.LIKE;
            }
            
            // 调用API进行互动
            const res = await interactionMakeInteractionWithComment(id, newInteractContent);
            
            if (res.success) {
                // 更新点赞状态
                setIsLiked(!isLiked);
                
                // 计算新的点赞数
                let newLikeCount;
                if (isDisliked) {
                    // 如果之前是踩，现在是点赞，点赞数+2
                    setIsDisliked(false);
                    newLikeCount = curLikeCount + 2;
                    setCurLikeCount(newLikeCount);
                } else {
                    // 正常点赞/取消点赞
                    newLikeCount = isLiked ? curLikeCount - 1 : curLikeCount + 1;
                    setCurLikeCount(newLikeCount);
                }
                
                // 通知父组件更新互动状态
                if (onInteractionChange) {
                    onInteractionChange(id, newInteractContent, newLikeCount);
                }
            } else {
                Msg.error(res.message);
            }
        } catch (error) {
            console.error(error);
        }
    }
    
    /**
     * 处理踩操作
     * @param {number} id - 回复ID
     */
    const handleDislike = async (id: number) => {
        try {
            // 确定互动内容
            let newInteractContent;
            if (isDisliked) {
                // 已经踩，点击后取消踩
                newInteractContent = INTERACT_COMMENT.NONE;
            } else {
                // 未踩，点击后踩
                newInteractContent = INTERACT_COMMENT.DISLIKE;
            }
            
            // 调用API进行互动
            const res = await interactionMakeInteractionWithComment(id, newInteractContent);
            
            if (res.success) {
                // 更新踩状态
                setIsDisliked(!isDisliked);
                
                // 计算新的点赞数
                let newLikeCount;
                if (isLiked) {
                    // 如果之前是点赞，现在是踩，点赞数-2
                    setIsLiked(false);
                    newLikeCount = curLikeCount - 2;
                    setCurLikeCount(newLikeCount);
                } else {
                    // 正常踩/取消踩
                    newLikeCount = isDisliked ? curLikeCount + 1 : curLikeCount - 1;
                    setCurLikeCount(newLikeCount);
                }
                
                // 通知父组件更新互动状态
                if (onInteractionChange) {
                    onInteractionChange(id, newInteractContent, newLikeCount);
                }
            } else {
                Msg.error(res.message);
            }
        } catch (error) {
            console.error(error);
        }
    }
    
    /**
     * 处理操作菜单点击事件
     */
    const handleMenuClick = useCallback(async () => {
        // 构建菜单选项
        const menuOptions = ["Copy", "Report"];
        
        // 检查是否显示删除选项
        const canDelete = user.isLoggedIn && 
                         (user.role !== UserRoleEnum.USER || userId === user.id);
        
        if (canDelete) {
            menuOptions.push("Delete");
        }
        
        // 显示菜单
        const selectedIndex = await Msg.menu(menuOptions, "Reply Options");
        
        // 处理用户选择
        switch (selectedIndex) {
            case 0: // Copy
                handleCopy();
                break;
            case 1: // Report
                setShowReportDialog(true);
                break;
            case 2: // Delete
                handleDelete();
                break;
            default:
                // 用户取消或关闭菜单
                break;
        }
    }, [user.isLoggedIn, user.role, user.id, userId]);
    
    /**
     * 处理复制回复内容
     */
    const handleCopy = useCallback(() => {
        try {
            copyToClipboard(content);
            Msg.success("Reply copied to clipboard");
        } catch (error) {
            Msg.error("Failed to copy reply");
        }
    }, [content]);
    
    /**
     * 处理删除回复
     */
    const handleDelete = useCallback(async () => {
        // 显示确认对话框
        const isConfirmed = await Msg.confirm("Are you sure you want to delete this reply?");
        
        if (isConfirmed) {
            try {
                // 调用删除回复API
                const res = await commentDeleteComment(id);
                
                if (res.success) {
                    Msg.success("Reply deleted successfully");
                    // 通知父组件更新评论列表
                    if (onCommentDelete) {
                        onCommentDelete(id);
                    }
                } else {
                    throw new Error(res.message);
                }
            } catch (error) {
                console.error(error);
                Msg.error("Failed to delete reply");
            }
        }
    }, [id, onCommentDelete]);

    return (
        <div className="comment-item comment-reply-item">
            <div className="comment-user-avatar">
                <img src={getSingleSimpleUserInfo(userId).avatarLink} alt="user-avatar" onClick={() => openSpaceView(userId)} />
            </div>
            <div className="comment-info">
                <div className="comment-header">
                    <h4 className="comment-user-name">{getSingleSimpleUserInfo(userId).name}</h4>
                    <div className="comment-menu">
                        <EllipsisHorizontalIcon className="menu-icon" onClick={handleMenuClick} />
                    </div>
                </div>
                <p className="comment-content">{content}</p>
                <p className="comment-footer">
                    <span className="comment-footer-time">{dayjs(createdAt).format("HH:mm, MMM DD, YYYY")} </span>
                    <span className="comment-footer-reply"
                        onClick={() => { 
                            // 设置评论目标，用于回复当前回复
                            setCommentTarget({ parentId: id, rootId: rootId, userId, commentToContent: content }) 
                        }}> Reply</span>
                    <span className="comment-footer-like" onClick={() => handleLike(id)}>
                        <HandThumbUpIcon className={isLiked ? "liked" : ""}/> {curLikeCount}
                    </span>
                    <span className="comment-footer-dislike" onClick={() => handleDislike(id)}>
                        <HandThumbDownIcon className={isDisliked ? "disliked" : ""} />
                    </span>
                </p>
            </div>
            
            {/* 举报对话框 - 使用Portal挂载到body下 */}
            {showReportDialog && createPortal(
                <ReportDialog
                    reportId={id}
                    reportTargetType={ReportTargetConstant.COMMENT}
                    onClose={() => setShowReportDialog(false)}
                />,
                document.body
            )}
        </div>
    )
}

export default ReplyItem;