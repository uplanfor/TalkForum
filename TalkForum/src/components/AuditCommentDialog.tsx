import React, { useState, useEffect, useCallback } from 'react';
import PopUpDialogBase from './PopUpDialogBase';
import { commentAdminGetCommentsByPage, commentAdminAuditComments, type Comment } from '../api/ApiComments';
import { PostCommentStatusEnum } from '../constants/post_comment_status';
import Msg from '../utils/msg';
import './styles/style_postdocument.css';
import './styles/style_auditcommentdialog.css';
import { getSingleSimpleUserInfo } from '../utils/simpleUserInfoCache';
import dayjs from 'dayjs';
import { debounce } from '../utils/debounce&throttle';


interface AuditCommentDialogProps {
    onClose: () => void;
}


const AuditCommentDialog = ({ onClose }: AuditCommentDialogProps) => {
    const [commentPendingQueue, setCommentPendingQueue] = useState<Comment[][]>([]);
    const [currentCommentListIndex, setCurrentCommentListIndex] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasMoreComments, setHasMoreComments] = useState<boolean>(true);
    const [auditedComments, setAuditedComments] = useState<Set<number>>(new Set()); // 跟踪已审核的评论
    const [currentListAudited, setCurrentListAudited] = useState<boolean[]>([]); // 跟踪当前列表中每条评论是否已审核
    // 新增状态：跟踪每条评论的审核结果（true: 通过, false: 拒绝）
    const [commentAuditResults, setCommentAuditResults] = useState<Map<number, boolean>>(new Map());

    // 加载评论队列 - 使用useCallback
    const loadCommentQueue = useCallback(async (page: number) => {
        setIsLoading(true);
        try {
            const res = await commentAdminGetCommentsByPage(page, 10, PostCommentStatusEnum.PENDING);
            
            if (res.success) {
                if (res.data.data.length === 0) {
                    if (page === 1) {
                        // 第一页就没有评论，显示无评论提示
                        Msg.error("No pending comments to review!");
                        onClose();
                    } else {
                        // 不是第一页但没有评论，说明没有更多评论了
                        setHasMoreComments(false);
                        Msg.error("No more pending comments!");
                    }
                    return;
                }
                
                // 将评论分成每10条一组
                const commentLists: Comment[][] = [];
                for (let i = 0; i < res.data.data.length; i += 10) {
                    commentLists.push(res.data.data.slice(i, i + 10));
                }
                
                if (page === 1) {
                    // 第一页，直接替换队列
                    setCommentPendingQueue(commentLists);
                    setCurrentCommentListIndex(0);
                } else {
                    // 不是第一页，追加到队列
                    setCommentPendingQueue(prev => [...prev, ...commentLists]);
                }
                
                // 初始化当前列表的审核状态
                const auditedStatus = new Array(commentLists[0]?.length || 0).fill(false);
                setCurrentListAudited(auditedStatus);
                
                // 如果返回的评论数少于10，说明没有更多评论了
                if (res.data.data.length < 10) {
                    setHasMoreComments(false);
                }
            } else {
                throw new Error(res.message || "Failed to get comment list.");
            }
        } catch (err) {
            Msg.error(err as string);
            onClose();
        } finally {
            setIsLoading(false);
        }
    }, [onClose]);

    // 初始加载
    useEffect(() => {
        loadCommentQueue(1);
    }, [loadCommentQueue]);

    // 处理上一个评论列表 - 使用useCallback
    const handlePrevCommentList = useCallback(() => {
        if (currentCommentListIndex > 0) {
            // 直接回到上一个评论列表
            setCurrentCommentListIndex(currentCommentListIndex - 1);
            // 更新当前列表的审核状态
            const auditedStatus = commentPendingQueue[currentCommentListIndex - 1]?.map(comment => 
                auditedComments.has(comment.id)
            ) || [];
            setCurrentListAudited(auditedStatus);
        } else {
            Msg.error("This is the first comment list in current queue.");
        }
    }, [currentCommentListIndex, commentPendingQueue, auditedComments]);

    // 处理下一个评论列表 - 使用useCallback
    const handleNextCommentList = useCallback(() => {
        // 检查当前列表是否所有评论都已审核
        const allAudited = currentListAudited.every(status => status === true);
        
        if (!allAudited) {
            Msg.error("Please review all comments in the current list before proceeding to the next list.");
            return;
        }
        
        if (currentCommentListIndex < commentPendingQueue.length - 1) {
            // 移动到下一个评论列表
            setCurrentCommentListIndex(currentCommentListIndex + 1);
            // 更新当前列表的审核状态
            const auditedStatus = commentPendingQueue[currentCommentListIndex + 1]?.map(comment => 
                auditedComments.has(comment.id)
            ) || [];
            setCurrentListAudited(auditedStatus);
            // 重置评论审核结果状态
            setCommentAuditResults(new Map());
        } else {
            // 当前是最后一个评论列表，尝试加载下一页
            if (hasMoreComments) {
                loadCommentQueue(currentPage + 1);
                setCurrentPage(currentPage + 1);
                setCurrentCommentListIndex(commentPendingQueue.length); // 设置为新加载的第一个评论列表
                // 重置评论审核结果状态
                setCommentAuditResults(new Map());
            } else {
                // 没有更多评论了
                Msg.error("No more comment lists to review!", 2000, true);
                setTimeout(() => {
                    onClose();
                }, 2000);
            }
        }
    }, [currentCommentListIndex, commentPendingQueue, currentListAudited, auditedComments, hasMoreComments, currentPage, loadCommentQueue, onClose]);

    // 处理提交所有更改 - 使用useCallback
    const handleCommitAllChanges = useCallback(async () => {
        // 检查当前列表是否所有评论都已审核
        const allAudited = currentListAudited.every(status => status === true);
        
        if (!allAudited) {
            Msg.error("Please review all comments in the current list before committing changes.");
            return;
        }
        
        // 收集当前列表中所有已审核但尚未提交的评论ID和审核结果
        const currentCommentList = commentPendingQueue[currentCommentListIndex];
        if (!currentCommentList) return;
        
        const approvedCommentIds: number[] = [];
        const rejectedCommentIds: number[] = [];
        
        currentCommentList.forEach(comment => {
            const auditResult = commentAuditResults.get(comment.id);
            if (auditResult === true) {
                approvedCommentIds.push(comment.id);
            } else if (auditResult === false) {
                rejectedCommentIds.push(comment.id);
            }
        });
        
        if (approvedCommentIds.length === 0 && rejectedCommentIds.length === 0) {
            Msg.error("No changes to commit.");
            return;
        }
        
        try {
            // 显示提交中消息
            Msg.success("Committing changes...", 2000, true);
            
            // 提交审核结果
            const promises = [];
            if (approvedCommentIds.length > 0) {
                promises.push(commentAdminAuditComments(approvedCommentIds, PostCommentStatusEnum.PASS));
            }
            if (rejectedCommentIds.length > 0) {
                promises.push(commentAdminAuditComments(rejectedCommentIds, PostCommentStatusEnum.REJECT));
            }
            
            const results = await Promise.all(promises);
            const allSuccess = results.every(res => res.success);
            
            if (allSuccess) {
                // 显示阻塞式成功消息，持续2秒
                Msg.success(`Successfully committed ${approvedCommentIds.length + rejectedCommentIds.length} comment changes!`, 2000, true);
                
                // 2秒后自动移动到下一个评论列表
                setTimeout(() => {
                    if (currentCommentListIndex < commentPendingQueue.length - 1) {
                        // 移动到下一个评论列表
                        setCurrentCommentListIndex(currentCommentListIndex + 1);
                        // 更新当前列表的审核状态
                        const auditedStatus = commentPendingQueue[currentCommentListIndex + 1]?.map(comment => 
                            auditedComments.has(comment.id)
                        ) || [];
                        setCurrentListAudited(auditedStatus);
                    } else {
                        // 当前是最后一个评论列表，尝试加载下一页
                        if (hasMoreComments) {
                            loadCommentQueue(currentPage + 1);
                            setCurrentPage(currentPage + 1);
                            setCurrentCommentListIndex(commentPendingQueue.length); // 设置为新加载的第一个评论列表
                        } else {
                            // 没有更多评论了
                            Msg.error("No more comment lists to review!", 2000, true);
                            setTimeout(() => {
                                onClose();
                            }, 2000);
                        }
                    }
                }, 2000);
            } else {
                throw new Error("Some changes failed to commit");
            }
        } catch (err) {
            Msg.error(err as string);
        }
    }, [currentCommentListIndex, commentPendingQueue, currentListAudited, commentAuditResults, auditedComments, hasMoreComments, currentPage, loadCommentQueue, onClose]);

    // 处理通过单条评论 - 使用防抖和useCallback
    const handlePassComment = useCallback(
        debounce(async (commentIndex: number) => {
            const currentCommentList = commentPendingQueue[currentCommentListIndex];
            if (!currentCommentList || commentIndex >= currentCommentList.length) return;
            
            const comment = currentCommentList[commentIndex];
            
            try {
                // 只更新本地状态，不立即提交到服务器
                // 显示阻塞式成功消息，持续1秒
                Msg.success("Comment marked as approved (not yet committed)", 1000, true);
                
                // 更新审核状态
                setAuditedComments(prev => new Set(prev).add(comment.id));
                setCurrentListAudited(prev => {
                    const newStatus = [...prev];
                    newStatus[commentIndex] = true;
                    return newStatus;
                });
                
                // 记录审核结果为通过
                setCommentAuditResults(prev => new Map(prev).set(comment.id, true));
            } catch (err) {
                Msg.error(err as string);
            }
        }, 300), // 300ms防抖延迟
        [commentPendingQueue, currentCommentListIndex]
    );

    // 处理拒绝单条评论 - 使用防抖和useCallback
    const handleRejectComment = useCallback(
        debounce(async (commentIndex: number) => {
            const currentCommentList = commentPendingQueue[currentCommentListIndex];
            if (!currentCommentList || commentIndex >= currentCommentList.length) return;
            
            const comment = currentCommentList[commentIndex];
            
            try {
                // 只更新本地状态，不立即提交到服务器
                // 显示阻塞式成功消息，持续1秒
                Msg.success("Comment marked as rejected (not yet committed)", 1000, true);
                
                // 更新审核状态
                setAuditedComments(prev => new Set(prev).add(comment.id));
                setCurrentListAudited(prev => {
                    const newStatus = [...prev];
                    newStatus[commentIndex] = true;
                    return newStatus;
                });
                
                // 记录审核结果为拒绝
                setCommentAuditResults(prev => new Map(prev).set(comment.id, false));
            } catch (err) {
                Msg.error(err as string);
            }
        }, 300), // 300ms防抖延迟
        [commentPendingQueue, currentCommentListIndex]
    );

    const currentCommentList = commentPendingQueue[currentCommentListIndex];

    // 定义底部按钮
    const bottomButtons = [
        {
            text: "Prev",
            onClick: handlePrevCommentList,
            type: "default" as const
        },
        {
            text: "Commit All Changes",
            onClick: handleCommitAllChanges,
            type: "submit" as const
        }
    ];

    // 如果没有评论，显示加载中或无评论提示
    if (commentPendingQueue.length === 0 && !isLoading) {
        return (
            <PopUpDialogBase
                title="Audit Comments"
                onClose={onClose}
            >
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    {isLoading ? "Loading comments..." : "No pending comments to review!"}
                </div>
            </PopUpDialogBase>
        );
    }

    return (
        <PopUpDialogBase
            title="Audit Comments"
            onClose={onClose}
            bottomBtns={bottomButtons}
        >
            {currentCommentList ? (
                <>
                    <div style={{ marginBottom: '15px', textAlign: 'center', fontSize: '16px', fontWeight: 'bold' }}>
                        Comment List {currentCommentListIndex + 1} of {commentPendingQueue.length}
                    </div>
                    <div className="comment-list-container">
                        {currentCommentList.map((comment, index) => (
                            <div key={comment.id} className={`comment-item ${currentListAudited[index] ? 'audited' : ''}`}>
                                <div className="comment-user-avatar">
                                    <img
                                        src={getSingleSimpleUserInfo(comment.userId).avatarLink}
                                        alt="Avatar"
                                        onClick={() => window.open(`/user/${comment.userId}`)}
                                    />
                                </div>
                                <div className="comment-info">
                                    <div className="comment-header">
                                        <span className="comment-author">
                                            {getSingleSimpleUserInfo(comment.userId).name}
                                        </span>
                                        <span className="comment-date">
                                            {dayjs(comment.createdAt).format("HH:mm:ss MMM DD, YYYY")}
                                        </span>
                                        {currentListAudited[index] && (
                                            <span className="audited-badge">Reviewed</span>
                                        )}
                                    </div>
                                    <div className="comment-content">
                                        {comment.content}
                                    </div>
                                    <div className="comment-actions">
                                        <button
                                            className={`reject-btn ${currentListAudited[index] ? 'disabled' : ''}`}
                                            onClick={() => handleRejectComment(index)}
                                            disabled={currentListAudited[index]}
                                        >
                                            Reject
                                        </button>
                                        <button
                                            className={`pass-btn ${currentListAudited[index] ? 'disabled' : ''}`}
                                            onClick={() => handlePassComment(index)}
                                            disabled={currentListAudited[index]}
                                        >
                                            Pass
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px', color: '#666' }}>
                        {currentListAudited.filter(status => status).length} of {currentCommentList.length} comments reviewed in this list
                    </div>
                </>
            ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    {isLoading ? "Loading comment list..." : "No comment list selected"}
                </div>
            )}
        </PopUpDialogBase>
    );
};

export default AuditCommentDialog;