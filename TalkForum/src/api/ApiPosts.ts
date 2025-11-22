import type ApiResponse from "./ApiResponse";
import Request from "../utils/Request";

interface Post {
    id: number;
    title: string;
    content: string;
    userId: number;
    clubId: number | null;
    status: number;
    isEssence: boolean;
    createdAt: string;
    updatedAt: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
}

interface PostResponse extends ApiResponse<Post> {}


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