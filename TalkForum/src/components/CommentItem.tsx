/**
 * 评论项组件
 * 用于展示单个评论及其回复列表
 * 支持展开/折叠回复、加载更多回复、回复评论等功能
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/solid';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { throttle } from '../utils/debounce&throttle';
import { commentGetCommentReplyList, commentDeleteComment } from '../api/ApiComments';
import { interactionMakeInteractionWithComment, INTERACT_COMMENT } from '../api/ApiInteractions';
import Msg  from '../utils/msg';
import { type Comment } from '../api/ApiComments';
import { type CommentTargetCallback } from '../pages/PostView';
import { getSingleSimpleUserInfo } from '../utils/simpleUserInfoCache';
import dayjs from 'dayjs';
import { SpaceViewType } from '../constants/default';
import { useSelector } from "react-redux";
import { type RootState } from "../store";
import { UserRoleEnum } from "../constants/user_constant";
import { ReportTargetConstant } from "../constants/report_constant";
import { copyToClipboard } from "../utils/clipboard";
import ReportDialog from "./ReportDialog";
import ReplyItem from "./ReplyItem";
import { createPortal } from 'react-dom';
import { useTranslation } from "react-i18next";

/**
 * 评论项组件属性接口
 * 继承自Comment接口，并添加了设置评论目标的回调函数
 */
export interface CommentItemProps extends Comment {
    setCommentTarget: CommentTargetCallback; // 设置评论目标的回调函数，用于回复评论
    onInteractionChange?: (commentId: number, newInteractContent: number, newLikeCount: number) => void; // 互动状态变化回调
    onCommentDelete?: (commentId: number) => void; // 评论删除回调
}

/**
 * 评论项组件
 * @param {CommentItemProps} props - 组件属性
 */
const CommentItem = ({ content, createdAt, userId, setCommentTarget, id, likeCount, commentCount, postId, interactContent, onInteractionChange, onCommentDelete }: CommentItemProps) => {
    // 国际化钩子
    const { t } = useTranslation();
    
    // 路由导航钩子
    const navigate = useNavigate();
    // 当前路由信息钩子
    const location = useLocation();
    // 获取用户状态
    const user = useSelector((state: RootState) => state.user);
    // 回复列表状态
    const [replyList, setReplyList] = useState<Comment[]>([]);
    
    // 是否展开回复列表状态
    const [notFoldReplyList, setNotFoldReplyList] = useState(true);
    
    // 是否还有更多回复状态
    const [hasMore, setHasMore] = useState(true);
    
    // 分页游标状态
    const [cursor, setCursor] = useState<number | null>(null);
    
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
     * 加载更多回复
     * 通过API请求获取当前评论的更多回复，并更新回复列表
     */
    const loadMoreReplies = async () => {
        try {
            // 调用API获取回复列表
            const res = await commentGetCommentReplyList(postId, cursor, id, null, 10);
            if (res.success) {
                // 更新回复列表
                setReplyList(prev => [...prev,...res.data.data]);
                // 更新是否还有更多回复
                setHasMore(res.data.hasMore);
                // 更新游标
                setCursor(res.data.cursor);
            } else {
                throw new Error(res.message);
            }
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * 切换回复列表的展开/折叠状态
     */
    const changeFoldReplyList = () => {
        setNotFoldReplyList(prev => !prev);
    }

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
     * 处理主评论点赞操作
     * @param {number} id - 评论ID
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
                
                // 通知父组件更新评论列表中的互动状态
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
     * 处理主评论踩操作
     * @param {number} id - 评论ID
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
                
                // 通知父组件更新评论列表中的互动状态
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
     * 节流处理的加载更多回复方法
     * 限制调用频率，防止频繁请求API
     */
    const throttleLoadMoreReplies = throttle(loadMoreReplies, 1000);
    
    /**
     * 处理操作菜单点击事件
     */
    const handleMenuClick = useCallback(async () => {
        // 构建菜单选项
        const menuOptions = [t('commentItem.copy'), t('commentItem.report')];
        
        // 检查是否显示删除选项
        const canDelete = user.isLoggedIn && 
                         (user.role !== UserRoleEnum.USER || userId === user.id);
        
        if (canDelete) {
            menuOptions.push(t('commentItem.delete'));
        }
        
        // 显示菜单
        const selectedIndex = await Msg.menu(menuOptions, t('commentItem.commentOptions'));
        
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
     * 处理复制评论内容
     */
    const handleCopy = useCallback(() => {
        try {
            copyToClipboard(content);
            Msg.success(t('commentItem.copySuccess'));
        } catch (error) {
            Msg.error(t('commentItem.copyFailed'));
        }
    }, [content]);
    
    /**
     * 处理删除评论
     */
    const handleDelete = useCallback(async () => {
        // 显示确认对话框
        const isConfirmed = await Msg.confirm(t('commentItem.deleteConfirm'));
        
        if (isConfirmed) {
            try {
                // TODO: 调用删除评论API
                const res = await commentDeleteComment(id);
                
                if (res.success) {
                    Msg.success(t('commentItem.deleteSuccess'));
                    // 通知父组件更新评论列表
                    if (onCommentDelete) {
                        onCommentDelete(id);
                    }
                } else {
                    throw new Error(res.message);
                }
            } catch (error) {
                console.error(error);
                Msg.error(t('commentItem.deleteFailed'));
            }
        }
    }, [id, onCommentDelete]);

    return (
        <div className="comment-item">
            {/* 用户头像 */}
            <div className="comment-user-avatar">
                <img src={getSingleSimpleUserInfo(userId).avatarLink} alt="user-avatar" onClick={() => openSpaceView(userId)} />
            </div>
            
            {/* 评论信息 */}
            <div className="comment-info">
                {/* 用户名和菜单 */}
                <div className="comment-header">
                    <h4 className="comment-user-name" onClick={() => openSpaceView(userId)}>{getSingleSimpleUserInfo(userId).name}</h4>
                    <div className="comment-menu">
                        <EllipsisHorizontalIcon className="menu-icon" onClick={handleMenuClick} />
                    </div>
                </div>
                
                {/* 评论内容 */}
                <p className="comment-content">{content}</p>
                
                {/* 评论底部信息：时间、回复按钮、点赞数、踩数 */}
                <p className="comment-footer">
                    <span className="comment-footer-time">{dayjs(createdAt).format("HH:mm, MMM DD, YYYY")} </span>
                    <span className="comment-footer-reply"
                        onClick={() => { 
                            // 设置评论目标，用于回复当前评论
                            setCommentTarget({ parentId: id, rootId: id, userId, commentToContent: content }) 
                        }}> {t('commentItem.reply')}</span>
                    <span className="comment-footer-like" onClick={() => handleLike(id)}>
                        <HandThumbUpIcon className={isLiked ? "liked" : ""}/> {curLikeCount}
                    </span>
                    <span className="comment-footer-dislike" onClick={() => handleDislike(id)}>
                        <HandThumbDownIcon className={isDisliked ? "disliked" : ""} />
                    </span>
                </p>
                
                {/* 回复列表（如果有回复） */}
                {commentCount > 0 &&
                    (<div className="comment-reply-list">
                        {/* 展开时显示回复列表 */}
                        {notFoldReplyList && (
                            replyList.map((comment) => (
                                <ReplyItem
                                    key={comment.id}
                                    {...comment}
                                    setCommentTarget={setCommentTarget}
                                    rootId={id}
                                    onInteractionChange={onInteractionChange}
                                    onCommentDelete={onCommentDelete}
                                />
                            ))
                        )}
                        
                        {/* 回复总数和操作按钮 */}
                        <p className="reply-total">{commentCount} {t('commentItem.replies')}
                            {/* 展开/折叠按钮 */}
                            {<span onClick={changeFoldReplyList}>{notFoldReplyList ? t('commentItem.fold') : t('commentItem.unfold')}</span>}
                            {/* 加载更多按钮（如果还有更多回复） */}
                            {hasMore && <span onClick={throttleLoadMoreReplies}>{t('commentItem.seeMore')}</span>} </p>
                    </div>)}
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

export default CommentItem;