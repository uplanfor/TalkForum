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

interface PostListParams {
    keyword?: string;
    clubIds?: number[];
    userIds?: number[];
    isEssence?: number;
    cursor?: number;
    pageSize: number;
}

interface AdminPosstListParams {
    keyword?: string;
    status?: string;
    clubIds?: number[];
    userIds?: number[];
    isEssence?: number;
    page?: number;
    pageSize: number;
}

interface PostTypePage {
    data: PostType[];
    total: number;
}


interface PostResponse extends ApiResponse<PostType> {}
interface PostTypePageResponse extends ApiResponse<PostTypePage> {}

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
export const postsGetPostList = async(params: PostListParams) : Promise<ApiResponse> => {
    return Request.get<ApiResponse>('/api/posts/', params);
};


/*
 * to delete a post
 */
export const postsDeletePostAuth = async (postId: string | number) : Promise<ApiResponse> => {
    return Request.delete_auth<ApiResponse>(`/api/posts/${postId}`);
};

/*
 * to modify a post
 */
export const postsModifyPostAuth = async (postId: string | number, content: string, title?: string, clubId?: number | null) : Promise<ApiResponse> => {
    return Request.put_auth<ApiResponse>(`/api/posts/${postId}`, {content, title, clubId});
};


/*
 * to get a post list for admin
 */
export const postsAdminGetPostList = async(params: AdminPosstListParams) : Promise<PostTypePageResponse> => {
    return Request.get_auth<PostTypePageResponse>('/api/posts/admin', params);
};

/*
 * to audit a post
 */
export const postsAdminAuditPost = async (postId: string | number, status: number) : Promise<ApiResponse> => {
    return Request.put_auth<ApiResponse>(`/api/posts/admin/${postId}/audit`, {status});
};

/*
 * to set a post as essence
 */
export const postsAdminSetPostAsEssence = async (postId: string | number, isEssence: number) : Promise<ApiResponse> => {
    return Request.put_auth<ApiResponse>(`/api/posts/admin/${postId}/essence`, {isEssence});
};