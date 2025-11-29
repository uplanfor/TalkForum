import type ApiResponse from "./ApiResponse";
import Request from "../utils/Request";

export interface Comment {
  id: number;
  postId: number;
  userId: number;
  rootId: number | null;
  parentId: number | null;
  content: string;
  status: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
}

export interface CommentList {
    data: Comment[];
    cursor: number | null;
    hasMore: boolean;
}

export interface CommentResopne extends ApiResponse<Comment> {}
export interface CommentListResponse extends ApiResponse<CommentList> {}

/*
 * Get comment list
 */
export const commentGetCommentList = (postId: number, cursor: number | null, pageSize: number): Promise<CommentListResponse> => {
    return Request.get<CommentListResponse>("/api/comments/", {
        postId,
        cursor,
        pageSize,
    });
}

/*
 * Get comment reply list
 */
export const commentGetCommentReplyList = (postId: number, cursor: number | null, rootId: number, parentId: number | null, pageSize: number): Promise<CommentListResponse> => {
    return Request.get<CommentListResponse>("/api/comments/replies", {
        postId, cursor, rootId, parentId, pageSize,
    });
}


/*
 * Post a comment
 */
export const commentPostComment = (postId: number, content: string, rootId: number | null, parentId: number | null): Promise<CommentResopne> => {
    return Request.post<CommentResopne>("/api/comments/", {
        postId, content, rootId, parentId,
    });
}


/*
 * delete a comment
 */
export const commentDeleteComment = (commentId: number): Promise<ApiResponse> => {
    return Request.delete<ApiResponse>(`/api/comments/${commentId}`);
}