/**
 * 评论相关API请求
 * 包含获取评论列表、获取评论回复列表、发布评论、删除评论和管理员获取评论等功能
 */
import type ApiResponse from "./ApiResponse";
import Request from "../utils/Request";

/**
 * 评论接口
 * 表示一条评论的详细信息
 */
export interface Comment {
  id: number;               // 评论ID
  postId: number;           // 帖子ID
  userId: number;           // 评论用户ID
  rootId: number | null;    // 根评论ID（如果是回复，指向顶级评论；否则为null）
  parentId: number | null;  // 父评论ID（如果是回复，指向直接父评论；否则为null）
  content: string;          // 评论内容
  status: string;           // 评论状态
  createdAt: string;        // 创建时间
  likeCount: number;        // 点赞数
  commentCount: number;     // 回复数
  interactContent: number;  // 互动内容
}

/**
 * 评论列表接口
 * 包含评论数据、游标和是否还有更多数据的标记
 */
export interface CommentList {
    data: Comment[];           // 评论数据数组
    cursor: number | null;     // 游标，用于分页查询
    hasMore: boolean;          // 是否还有更多数据
}

/**
 * 评论分页接口
 * 包含评论数据和总数
 */
export interface CommentPage {
    data: Comment[];           // 评论数据数组
    total: number;             // 评论总数
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
 * @param {number} postId - 帖子ID
 * @param {number | null} cursor - 游标，用于分页查询
 * @param {number} pageSize - 每页大小
 * @returns {Promise<CommentListResponse>} 评论列表响应
 */
export const commentGetCommentList = (postId: number, cursor: number | null, pageSize: number): Promise<CommentListResponse> => {
    return Request.get<CommentListResponse>("/api/comments/", {
        postId,
        cursor,
        pageSize,
    });
}

/**
 * 获取评论回复列表
 * @param {number} postId - 帖子ID
 * @param {number | null} cursor - 游标，用于分页查询
 * @param {number} rootId - 根评论ID
 * @param {number | null} parentId - 父评论ID
 * @param {number} pageSize - 每页大小
 * @returns {Promise<CommentListResponse>} 评论回复列表响应
 */
export const commentGetCommentReplyList = (postId: number, cursor: number | null, rootId: number, parentId: number | null, pageSize: number): Promise<CommentListResponse> => {
    return Request.get<CommentListResponse>("/api/comments/replies", {
        postId, cursor, rootId, parentId, pageSize,
    });
}

/**
 * 发布评论
 * @param {number} postId - 帖子ID
 * @param {string} content - 评论内容
 * @param {number | null} rootId - 根评论ID（如果是回复，指向顶级评论；否则为null）
 * @param {number | null} parentId - 父评论ID（如果是回复，指向直接父评论；否则为null）
 * @returns {Promise<CommentResopne>} 评论响应
 */
export const commentPostComment = (postId: number, content: string, rootId: number | null, parentId: number | null): Promise<CommentResopne> => {
    return Request.post<CommentResopne>("/api/comments/", {
        postId, content, rootId, parentId,
    });
}

/**
 * 删除评论
 * @param {number} commentId - 评论ID
 * @returns {Promise<ApiResponse>} 删除结果响应
 */
export const commentDeleteComment = (commentId: number): Promise<ApiResponse> => {
    return Request.delete<ApiResponse>(`/api/comments/${commentId}`);
}

/**
 * 管理员获取评论列表（分页）
 * @param {number} page - 页码
 * @param {number} pageSize - 每页大小
 * @param {string | null} stauts - 评论状态（可选，用于筛选）
 * @returns {Promise<CommentPageResponse>} 评论分页响应
 */
export const commentAdminGetCommentsByPage = (page: number, pageSize: number, stauts: string | null): Promise<CommentPageResponse> => {
    return Request.get_auth<CommentPageResponse>("/api/comments/admin", {
        page, pageSize, stauts,
    });
}