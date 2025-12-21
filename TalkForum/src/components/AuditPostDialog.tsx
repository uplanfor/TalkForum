import React, { useState, useEffect, useCallback } from 'react';
import PopUpDialogBase from './PopUpDialogBase';
import {
    postsAdminGetPostList,
    postsAdminAuditPost,
    type PostType,
    postsAdminGetPostContent,
} from '../api/ApiPosts';
import { PostCommentStatusEnum } from '../constants/post_comment_status';
import Msg from '../utils/msg';
import { parseMarkdown } from '../utils/MarkdownUtil';
import './styles/style_postdocument.css';
import { getSingleSimpleUserInfo } from '../utils/simpleUserInfoCache';
import dayjs from 'dayjs';
import { debounce } from '../utils/debounce&throttle';

interface AuditPostDialogProps {
    onClose: () => void;
}

const AuditPostDialog = ({ onClose }: AuditPostDialogProps) => {
    const [postPendingQueue, setPostPendingQueue] = useState<PostType[]>([]);
    const [currentPostIndex, setCurrentPostIndex] = useState<number>(0);
    const [renderContent, setRenderContent] = useState<string>('Loading...');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasMorePosts, setHasMorePosts] = useState<boolean>(true);
    const [auditedPosts, setAuditedPosts] = useState<Set<number>>(new Set()); // 跟踪已审核的帖子

    // 加载帖子内容 - 使用useCallback
    const loadPostContent = useCallback(async (postId: number) => {
        try {
            const res = await postsAdminGetPostContent(postId);
            if (res.success) {
                const t = await parseMarkdown(res.data);
                setRenderContent(t.html);
            } else {
                throw new Error(res.message || 'Failed to get post content.');
            }
        } catch (err) {
            Msg.error(err as string);
            setRenderContent('Failed to load content.');
        }
    }, []);

    // 加载帖子队列 - 使用useCallback
    const loadPostQueue = useCallback(
        async (page: number) => {
            setIsLoading(true);
            try {
                const res = await postsAdminGetPostList({
                    page: page,
                    pageSize: 20,
                    status: PostCommentStatusEnum.PENDING,
                });

                if (res.success) {
                    if (res.data.data.length === 0) {
                        if (page === 1) {
                            // 第一页就没有帖子，显示无帖子提示
                            Msg.error('No pending posts to review!');
                            onClose();
                        } else {
                            // 不是第一页但没有帖子，说明没有更多帖子了
                            setHasMorePosts(false);
                            Msg.error('No more pending posts!');
                        }
                        return;
                    }

                    if (page === 1) {
                        // 第一页，直接替换队列
                        setPostPendingQueue(res.data.data);
                        setCurrentPostIndex(0);
                    } else {
                        // 不是第一页，追加到队列
                        setPostPendingQueue(prev => [...prev, ...res.data.data]);
                    }

                    // 如果返回的帖子数少于20，说明没有更多帖子了
                    if (res.data.data.length < 20) {
                        setHasMorePosts(false);
                    }
                } else {
                    throw new Error(res.message || 'Failed to get post list.');
                }
            } catch (err) {
                Msg.error(err as string);
                onClose();
            } finally {
                setIsLoading(false);
            }
        },
        [onClose]
    );

    // 初始加载
    useEffect(() => {
        loadPostQueue(1);
    }, [loadPostQueue]);

    // 当前帖子变化时，加载帖子内容
    useEffect(() => {
        if (postPendingQueue.length > 0 && currentPostIndex < postPendingQueue.length) {
            const currentPost = postPendingQueue[currentPostIndex];
            loadPostContent(currentPost.id);
        }
    }, [currentPostIndex, postPendingQueue, loadPostContent]);

    // 处理上一个帖子 - 使用useCallback
    const handlePrevPost = useCallback(() => {
        if (currentPostIndex > 0) {
            // 直接回到上一个帖子（包括已审核的）
            setCurrentPostIndex(currentPostIndex - 1);
        } else {
            Msg.error('This is the first post in current queue.');
        }
    }, [currentPostIndex]);

    // 处理拒绝帖子 - 使用防抖和useCallback
    const handleRejectPost = useCallback(
        debounce(async () => {
            if (postPendingQueue.length === 0 || currentPostIndex >= postPendingQueue.length)
                return;

            const currentPost = postPendingQueue[currentPostIndex];
            try {
                const res = await postsAdminAuditPost(currentPost.id, PostCommentStatusEnum.REJECT);

                if (res.success) {
                    // 显示阻塞式成功消息，持续2秒
                    Msg.success('Post rejected successfully!', 2000, true);

                    // 2秒后自动移动到下一个帖子
                    setTimeout(() => {
                        // 将帖子添加到已审核列表
                        setAuditedPosts(prev => new Set(prev).add(currentPost.id));

                        // 自动移动到下一个帖子（包括已审核的）
                        if (currentPostIndex < postPendingQueue.length - 1) {
                            setCurrentPostIndex(currentPostIndex + 1);
                        } else {
                            // 当前是最后一个帖子，尝试加载下一页
                            if (hasMorePosts) {
                                loadPostQueue(currentPage + 1);
                                setCurrentPage(currentPage + 1);
                                setCurrentPostIndex(0); // 重置到新队列的第一个帖子
                            } else {
                                // 没有更多帖子了
                                Msg.error('No more posts to review!', 2000, true);
                                setTimeout(() => {
                                    onClose();
                                }, 2000);
                            }
                        }
                    }, 2000);
                } else {
                    throw new Error(res.message || 'Failed to reject post.');
                }
            } catch (err) {
                Msg.error(err as string);
            }
        }, 300), // 300ms防抖延迟
        [postPendingQueue, currentPostIndex, currentPage, hasMorePosts, loadPostQueue, onClose]
    );

    // 处理通过帖子 - 使用防抖和useCallback
    const handlePassPost = useCallback(
        debounce(async () => {
            if (postPendingQueue.length === 0 || currentPostIndex >= postPendingQueue.length)
                return;

            const currentPost = postPendingQueue[currentPostIndex];
            try {
                const res = await postsAdminAuditPost(currentPost.id, PostCommentStatusEnum.PASS);

                if (res.success) {
                    // 显示阻塞式成功消息，持续2秒
                    Msg.success('Post approved successfully!', 2000, true);

                    // 2秒后自动移动到下一个帖子
                    setTimeout(() => {
                        // 将帖子添加到已审核列表
                        setAuditedPosts(prev => new Set(prev).add(currentPost.id));

                        // 自动移动到下一个帖子（包括已审核的）
                        if (currentPostIndex < postPendingQueue.length - 1) {
                            setCurrentPostIndex(currentPostIndex + 1);
                        } else {
                            // 当前是最后一个帖子，尝试加载下一页
                            if (hasMorePosts) {
                                loadPostQueue(currentPage + 1);
                                setCurrentPage(currentPage + 1);
                                setCurrentPostIndex(0); // 重置到新队列的第一个帖子
                            } else {
                                // 没有更多帖子了
                                Msg.error('No more posts to review!', 2000, true);
                                setTimeout(() => {
                                    onClose();
                                }, 2000);
                            }
                        }
                    }, 2000);
                } else {
                    throw new Error(res.message || 'Failed to approve post.');
                }
            } catch (err) {
                Msg.error(err as string);
            }
        }, 300), // 300ms防抖延迟
        [postPendingQueue, currentPostIndex, currentPage, hasMorePosts, loadPostQueue, onClose]
    );

    const currentPost = postPendingQueue[currentPostIndex];
    const { userId, isEssence, updatedAt, title } = currentPost || {};

    // 定义底部按钮
    const bottomButtons = [
        {
            text: 'Prev',
            onClick: handlePrevPost,
            type: 'default' as const,
        },
        {
            text: 'Reject',
            onClick: handleRejectPost,
            type: 'cancel' as const,
        },
        {
            text: 'Pass',
            onClick: handlePassPost,
            type: 'submit' as const,
        },
    ];

    // 如果没有帖子，显示加载中或无帖子提示
    if (postPendingQueue.length === 0 && !isLoading) {
        return (
            <PopUpDialogBase title='Audit Posts' onClose={onClose}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    {isLoading ? 'Loading posts...' : 'No pending posts to review!'}
                </div>
            </PopUpDialogBase>
        );
    }

    return (
        <PopUpDialogBase title='Audit Posts' onClose={onClose} bottomBtns={bottomButtons}>
            {currentPost ? (
                <>
                    <div className='post-header'>
                        <h1 className='post-title'>{title}</h1>
                        <div className='author-info'>
                            <img
                                src={getSingleSimpleUserInfo(userId).avatarLink}
                                alt='Avatar'
                                onClick={() => window.open(`/user/${userId}`)}
                            />
                            <div className='author-combo'>
                                <span className='author-name'>
                                    {getSingleSimpleUserInfo(userId).name}
                                </span>
                                <span className='post-date'>
                                    {isEssence != 0 && <span className='badge'>Essence</span>}
                                    Last Edited at {dayjs(updatedAt).format('HH:mm:ss MM DD, YYYY')}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div
                        className='post-content'
                        dangerouslySetInnerHTML={{ __html: renderContent }}
                    ></div>
                    <div
                        style={{
                            textAlign: 'center',
                            marginTop: '10px',
                            fontSize: '14px',
                            color: '#666',
                        }}
                    >
                        Post {currentPostIndex + 1} of {postPendingQueue.length} in current queue
                        {auditedPosts.has(currentPost?.id) && (
                            <span style={{ marginLeft: '10px', color: '#888' }}>(Reviewed)</span>
                        )}
                    </div>
                </>
            ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    {isLoading ? 'Loading post content...' : 'No post selected'}
                </div>
            )}
        </PopUpDialogBase>
    );
};

export default AuditPostDialog;
