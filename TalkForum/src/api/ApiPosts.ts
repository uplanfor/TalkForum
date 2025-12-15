/**
 * 帖子相关API请求
 * 处理帖子的发布、获取、删除、修改以及管理员相关操作
 */
import type ApiResponse from "./ApiResponse";
import Request from "../utils/Request";
import { PostCommentStatusEnum, type PostStatus } from "../constants/post_comment_status";
import PostDialog from "../components/PostDialog";

/**
 * 帖子类型接口
 * 定义了帖子的基本信息结构
 */
export interface PostType {
    id: number;               // 帖子ID
    title: string;            // 帖子标题
    brief: string;           // 帖子简介
    content: string;          // 帖子内容
    userId: number;           // 发布用户ID
    clubId: number | null;    // 所属俱乐部ID（可为空）
    status: string;           // 帖子状态
    isEssence: number;        // 是否精华（0：非精华，1：精华）
    createdAt: string;        // 创建时间
    updatedAt: string;        // 更新时间
    viewCount: number;        // 浏览量
    likeCount: number;        // 点赞数
    commentCount: number;     // 评论数
    coverUrl: string | null;  // 帖子封面URL（可为空）
    tag1: string | null;      // 标签1（可为空）
    tag2: string | null;      // 标签2（可为空）
    tag3: string | null;      // 标签3（可为空）
    interactContent: number;  // 互动内容(（参考interaction接口）
}

/**
 * 帖子列表请求参数接口
 * 定义了获取帖子列表时的查询参数
 */
export interface PostListParams {
    keyword?: string;         // 关键词
    clubIds?: number[];       // 俱乐部ID列表
    userIds?: number[];       // 用户ID列表
    isEssence?: number;       // 是否精华
    cursor?: number | null;   // 游标，用于分页
    pageSize: number;         // 每页大小
    tag?: string;             // 标签
}

/**
 * 管理员帖子列表请求参数接口
 * 定义了管理员获取帖子列表时的查询参数
 */
export interface AdminPostListParams {
    keyword?: string;         // 关键词
    status?: string;          // 帖子状态
    clubIds?: number[];       // 俱乐部ID列表
    userIds?: number[];       // 用户ID列表
    isEssence?: number;       // 是否精华
    page?: number;            // 页码
    pageSize: number;         // 每页大小
    tag?: string;             // 标签
}

/**
 * 帖子分页类型接口
 * 定义了帖子分页数据的结构
 */
export interface PostTypePage {
    data: PostType[];         // 帖子列表数据
    total: number;            // 总帖子数
}

/**
 * 帖子创建参数接口
 * 定义了创建帖子时的请求参数
 */
export interface PostCreateParams {
    title?: string;             // 帖子标题
    content: string;           // 帖子内容
    clubId?: number | null;    // 所属圈子ID（可为空）
    tag1?: string;             // 标签1（可为空）
    tag2?: string;             // 标签2（可为空）
    tag3?: string;             // 标签3（可为空
}

/**
 * 帖子编辑参数接口
 * 定义了编辑帖子时的请求参数
 */
export interface PostEditParams extends PostCreateParams {
}


/**
 * 帖子响应接口
 * 扩展了ApiResponse接口，包含PostType类型的数据
 */
interface PostResponse extends ApiResponse<PostType> {}

/**
 * 帖子分页响应接口
 * 扩展了ApiResponse接口，包含PostTypePage类型的数据
 */
interface PostTypePageResponse extends ApiResponse<PostTypePage> {}

/**
 * 帖子内容响应接口
 */
interface PostContentResponse extends ApiResponse<string> {}

/**
 * 发布新帖子
 * @param content 帖子内容
 * @param title 帖子标题（可选）
 * @param clubId 俱乐部ID（可选）
 * @returns 发布帖子的响应
 */
export const postsCommitPostAuth = async (params: PostCreateParams) : Promise<ApiResponse> => {
    return Request.post_auth<ApiResponse>('/api/posts/', params);
};

/**
 * 获取帖子详情信息
 * @param postId 帖子ID
 * @returns 帖子详情响应
 */
export const postsGetPostDetailInformation = async (postId: string | number) : Promise<PostResponse> => {
    return Request.get<PostResponse>(`/api/posts/${postId}`);
};

/**
 * 获取帖子列表
 * @param params 帖子列表请求参数
 * @returns 帖子列表响应
 */
export const postsGetPostList = async(params: PostListParams) : Promise<ApiResponse> => {
    return Request.get<ApiResponse>('/api/posts/', params);
};

/**
 * 删除帖子
 * @param postId 帖子ID
 * @returns 删除帖子的响应
 */
export const postsDeletePostAuth = async (postId: string | number) : Promise<ApiResponse> => {
    return Request.delete_auth<ApiResponse>(`/api/posts/${postId}`);
};

/**
 * 修改帖子
 * @param postId 帖子ID
 * @param content 帖子内容
 * @param title 帖子标题（可选）
 * @param clubId 俱乐部ID（可选）
 * @returns 修改帖子的响应
 */
export const postsModifyPostAuth = async (postId: string | number, params: PostEditParams) : Promise<ApiResponse> => {
    return Request.put_auth<ApiResponse>(`/api/posts/${postId}`, params);
};

/**
 * 管理员获取帖子列表
 * @param params 管理员帖子列表请求参数
 * @returns 管理员帖子列表响应
 */
export const postsAdminGetPostList = async(params: AdminPostListParams) : Promise<PostTypePageResponse> => {
    return Request.get_auth<PostTypePageResponse>('/api/posts/admin', params);
};

/**
 * 管理员审核帖子
 * @param postId 帖子ID
 * @param status 审核状态
 * @returns 审核帖子的响应
 */
export const postsAdminAuditPost = async (postId: string | number, status: PostStatus) : Promise<ApiResponse> => {
    return Request.put_auth<ApiResponse>(`/api/posts/admin/${postId}/audit`, {status});
};

/**
 * 管理员设置帖子精华
 * @param postId 帖子ID
 * @param isEssence 是否精华（0：非精华，1：精华）
 * @returns 设置帖子精华的响应
 */
export const postsAdminSetPostAsEssence = async (postId: string | number, isEssence: number) : Promise<ApiResponse> => {
    return Request.put_auth<ApiResponse>(`/api/posts/admin/${postId}/essence`, {isEssence});
};


/**
 * 管理员获得帖子内容
 * @param postId 帖子ID
 * @returns 帖子内容响应
 */
export const postsAdminGetPostContent = async (PostId: string | number) : Promise<ApiResponse> => {
    return Request.get_auth<PostContentResponse>(`/api/posts/admin/${PostId}/content`);
}