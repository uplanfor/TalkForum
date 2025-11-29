import type ApiResponse from "./ApiResponse";
import Request from "../utils/Request";

/*
 * Post Type
 * @param id: number
 * @param title: string
 * @param content: string
 * @param userId: number
 * @param clubId: number | null
 * @param status: number
 * @param isEssence: number
 * @param createdAt: string
 * @param updatedAt: string
 * @param viewCount: number
 * @param likeCount: number
 */
export interface PostType {
    id: number;
    title: string;
    content: string;
    userId: number;
    clubId: number | null;
    status: number;
    isEssence: number;
    createdAt: string;
    updatedAt: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
}
interface PostResponse extends ApiResponse<PostType> {}



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
export const postsGetPostDetailInformation = async (postId: string | number) : Promise<PostResponse> => {
    return Request.get<PostResponse>(`/api/posts/${postId}`);
};

/*
 * to get a post list
 */
export const postsGetPostList = async(pageSize: number, cursor?: number | null) : Promise<ApiResponse> => {
    return Request.get<ApiResponse>('/api/posts/', {pageSize, cursor});
};


/*
 * to delete a post
 */
export const postsDeletePost = async (postId: string | number) : Promise<ApiResponse> => {
    return Request.delete<ApiResponse>(`/api/posts/${postId}`);
};

/*
 * to modify a post
 */
export const postsModifyPost = async (postId: string | number, content: string, title?: string, clubId?: number | null) : Promise<ApiResponse> => {
    return Request.put<ApiResponse>(`/api/posts/${postId}`, {content, title, clubId});
};
