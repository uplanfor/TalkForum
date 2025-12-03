/**
 * 邀请码相关API请求
 * 包含获取邀请码、管理员获取邀请码列表以及生成邀请码等功能
 */
import type ApiResponse from "./ApiResponse";
import Request from "../utils/Request";

/**
 * 邀请码接口
 * 包含邀请码的详细信息
 */
export interface Invitecode {
    code: string;         // 邀请码字符串
    creatorId: string;    // 创建者ID
    createdAt: string;    // 创建时间
    expiredAt: string;     // 过期时间
    maxCount: number;     // 最大使用次数
    usedCount: number;    // 已使用次数
}

/**
 * 邀请码分页接口
 * 包含邀请码列表和总数，用于分页展示
 */
export interface InvitecodePage {
    data: Invitecode[];   // 邀请码数据数组
    total: number;        // 邀请码总数
}

/**
 * 获取邀请码响应接口
 */
export interface GetInvitecodesResponse extends ApiResponse<Invitecode[]> {}

/**
 * 邀请码分页响应接口
 */
export interface InvitecodePageResponse extends ApiResponse<InvitecodePage> {}

/**
 * 生成邀请码响应接口
 */
export interface GenerateInvitecodeResponse extends ApiResponse<Invitecode[]> {}

/**
 * 获取当前用户的邀请码
 * @returns {Promise<GetInvitecodeResponse>} 邀请码响应
 */
export const getMyInvitecodes = async (): Promise<GetInvitecodesResponse> => {
    return Request.get<GetInvitecodesResponse>("/api/invitecode/");
};

/**
 * 管理员获取邀请码列表（分页）
 * @param {number} page - 页码
 * @param {number} pageSize - 每页大小
 * @returns {Promise<InvitecodePageResponse>} 邀请码分页响应
 */
export const adminGetInvitecodeByPage = async (page: number, pageSize: number): Promise<InvitecodePageResponse> => {
    return Request.get<InvitecodePageResponse>("/api/invitecode/admin", { page, pageSize });
};

/**
 * 生成邀请码
 * @param {number} maxCount - 每个邀请码的最大使用次数
 * @param {number} expireDays - 邀请码的过期天数
 * @param {number} generateCount - 生成的邀请码数量
 * @returns {Promise<GenerateInvitecodeResponse>} 生成邀请码响应
 */
export const generateInvitecode = async (maxCount: number, expireDays: number, generateCount: number): Promise<GenerateInvitecodeResponse> => {
    return Request.post<GenerateInvitecodeResponse>("/api/invitecode/admin", { maxCount, expireDays, generateCount });
};