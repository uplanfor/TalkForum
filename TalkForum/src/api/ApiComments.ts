/**
 * 评论相关API请求
 * 包含获取评论列表、获取评论回复列表、发布评论、删除评论和管理员获取评论等功能
 */
import type ApiResponse from './ApiResponse';
import Request from '../utils/Request';
import { type CommentStatus } from '../constants/post_comment_status';

/**
 * 评论接口
 * 表示一条评论的详细信息
 */
export interface Comment {
    id: string; // 评论ID
    postId: string; // 帖子ID
    userId: string; // 评论用户ID
    rootId: string | null; // 根评论ID（如果是回复，指向顶级评论；否则为null）
    parentId: string | null; // 父评论ID（如果是回复，指向直接父评论；否则为null）
    content: string; // 评论内容
    status: string; // 评论状态
    createdAt: string; // 创建时间
    likeCount: number; // 点赞数
    commentCount: number; // 回复数
    images: string;  // 图片列表
    interactContent: number; // 互动内容
}

/**
 * 评论列表接口
 * 包含评论数据、游标和是否还有更多数据的标记
 */
export interface CommentList {
    data: Comment[]; // 评论数据数组
    cursor: string | null; // 游标，用于分页查询
    hasMore: boolean; // 是否还有更多数据
}

/**
 * 评论分页接口
 * 包含评论数据和总数
 */
export interface CommentPage {
    data: Comment[]; // 评论数据数组
    total: number; // 评论总数
}

/**
 * 单条评论响应接口
 */
export interface CommentResopne extends ApiResponse<Comment> {}

/**
 * 评论列表响应接口
 */
export interface CommentListResponse extends ApiResponse<CommentList> {}

/**
 * 评论分页响应接口
 */
export interface CommentPageResponse extends ApiResponse<CommentPage> {}

/**
 * 获取评论列表
 * @param {string} postId - 帖子ID
 * @param {string | null} cursor - 游标，用于分页查询
 * @param {string} pageSize - 每页大小
 * @returns {Promise<CommentListResponse>} 评论列表响应
 */
export const commentGetCommentList = (
    postId: string,
    cursor: string | null,
    pageSize: number
): Promise<CommentListResponse> => {
    return Request.get<CommentListResponse>('/api/comments/', {
        postId,
        cursor,
        pageSize,
    });
};

/**
 * 获取评论回复列表
 * @param {string} postId - 帖子ID
 * @param {string | null} cursor - 游标，用于分页查询
 * @param {string} rootId - 根评论ID
 * @param {string | null} parentId - 父评论ID
 * @param {number} pageSize - 每页大小
 * @returns {Promise<CommentListResponse>} 评论回复列表响应
 */
export const commentGetCommentReplyList = (
    postId: string,
    cursor: string | null,
    rootId: string,
    parentId: string | null,
    pageSize: number
): Promise<CommentListResponse> => {
    return Request.get<CommentListResponse>('/api/comments/replies', {
        postId,
        cursor,
        rootId,
        parentId,
        pageSize,
    });
};

/**
 * 发布评论
 * @param {string} postId - 帖子ID
 * @param {string} content - 评论内容
 * @param {string | null} rootId - 根评论ID（如果是回复，指向顶级评论；否则为null）
 * @param {string | null} parentId - 父评论ID（如果是回复，指向直接父评论；否则为null）
 * @returns {Promise<CommentResopne>} 评论响应
 */
export const commentPostComment = (
    postId: string,
    content: string,
    rootId: string | null,
    parentId: string | null
): Promise<CommentResopne> => {
    return Request.post<CommentResopne>('/api/comments/', {
        postId,
        content,
        rootId,
        parentId,
    });
};

/**
 * 删除评论
 * @param {string} commentId - 评论ID
 * @returns {Promise<ApiResponse>} 删除结果响应
 */
export const commentDeleteComment = (commentId: string): Promise<ApiResponse> => {
    return Request.delete<ApiResponse>(`/api/comments/${commentId}`);
};

/**
 * 管理员获取评论列表（分页）
 * @param {number} page - 页码
 * @param {number} pageSize - 每页大小
 * @param {string | null} status - 评论状态（可选，用于筛选）
 * @returns {Promise<CommentPageResponse>} 评论分页响应
 */
export const commentAdminGetCommentsByPage = (
    page: number,
    pageSize: number,
    status?: CommentStatus | null
): Promise<CommentPageResponse> => {
    return Request.get_auth<CommentPageResponse>('/api/comments/admin', {
        page,
        pageSize,
        status,
    });
};

/**
 * 管理员审核评论
 * @param {string[]} commentIds - 评论ID数组
 * @param {string} status - 审核状态
 * @returns {Promise<ApiResponse>} 审核结果响应
 */
export const commentAdminAuditComments = (
    commentIds: string[],
    status: CommentStatus
): Promise<ApiResponse> => {
    return Request.put_auth<ApiResponse>('/api/comments/admin/audit', {
        commentIds,
        status,
    });
};

/**
 * 管理员获得评论内容
 * @param {string[]} commentIds - 评论ID数组
 * @returns {Promise<ApiResponse<Comment[]>>} 评论内容响应
 */
export const commentAdminGetCommentsContent = (
    commentIds: string[]
): Promise<ApiResponse<Comment[]>> => {
    return Request.get_auth<ApiResponse<Comment[]>>('/api/comments/admin/content', {
        commentIds,
    });
};
