import type ApiResponse from "./ApiResponse";
import Request from "../utils/Request";

/*
 * to post a new post
 */
export const postsCommitPostAuth = async (content: string, title?: string, clubId?: number | null) : Promise<ApiResponse> => {
    return Request.post_auth<ApiResponse>('/api/posts/', {
        content,
        title,
        clubId
    });
};

/*
 * to get a post detail information
 */
export const postsGetPostDetailInformation = async (postId: string | number) : Promise<ApiResponse> => {
    return Request.get<ApiResponse>(`/api/posts/${postId}`);
};

/*
 * to get a post list
 */
export const postsGetPostList = async(pageSize: number, cursor?: number | null) : Promise<ApiResponse> => {
    return Request.get<ApiResponse>('/api/posts/', {pageSize, cursor});
};