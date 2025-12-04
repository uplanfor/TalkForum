/**
 * 互动相关API请求
 * 支持点赞，踩，关注
 */

import type ApiResponse from "./ApiResponse";
import Request from "../utils/Request";

export const INTERACT_TYPE = {
    USER: "USER",
    POST: "POST",
    COMMENT: "COMMENT"
}

export const INTERACT_POST = {
    LIKE: 1,
    DISLIKE: -1,
    NONE: 0,
};


export const INTERACT_COMMENT = {
    LIKE: 1,
    DISLIKE: -1,
    NONE: 0
};


export const INTERACT_USER = {
    FOLLOW: 1,
    UNFOLLOW: 0
};


/**
 * 与用户互动
 * @param interactId 互动对象ID
 * @param interactContent 互动内容
 */
export const interactionMakeInteractionWithUser = (interactId: number, interactContent: number): Promise<ApiResponse> => {
    return Request.post_auth<ApiResponse>(`/api/interactions/`, 
        { interactId, interactContent, interactType: INTERACT_TYPE.USER });
};

/**
 * 与帖子互动
 * @param interactId 互动对象ID
 * @param interactContent 互动内容
 */
export const interactionMakeInteractionWithPost = (interactId: number, interactContent: number): Promise<ApiResponse> => {
    return Request.post_auth<ApiResponse>(`/api/interactions/`, 
        { interactId, interactContent, interactType: INTERACT_TYPE.POST });
};

/**
 * 与评论互动
 * @param interactId 互动对象ID
 * @param interactContent 互动内容
 */
export const interactionMakeInteractionWithComment = (interactId: number, interactContent: number): Promise<ApiResponse> => {
    return Request.post_auth<ApiResponse>(`/api/interactions/`, 
        { interactId, interactContent, interactType: INTERACT_TYPE.COMMENT });
};