/**
 * 用户相关API请求
 * 包含用户注册、获取用户信息、更新用户资料、修改密码以及管理员用户管理等功能
 */
import type ApiResponse from './ApiResponse';
import Request from '../utils/Request';
import type { UserRole, UserStatus } from '../constants/user_constant';

/**
 * 简单用户信息接口
 * 包含用户的基本信息，用于列表展示等场景
 */
export interface SimpleUserInfo {
    avatarLink: string; // 用户头像链接
    name: string; // 用户昵称
}

/**
 * 用户资料接口
 * 包含用户可编辑的资料信息
 */
export interface UserProfile {
    name: string; // 用户昵称
    intro: string; // 用户简介
    avatarLink: string; // 用户头像链接
    backgroundLink: string; // 用户背景图链接
}

/**
 * 用户视图对象接口
 * 包含用户的详细信息，用于个人主页、管理员管理等场景
 */
export interface UserVO {
    id: number; // 用户ID
    name: string; // 用户昵称
    email: string; // 用户邮箱
    intro: string; // 用户简介
    fansCount: number; // 粉丝数
    followingCount: number; // 关注数
    avatarLink: string; // 用户头像链接
    backgroundLink: string; // 用户背景图链接
    createdAt: string; // 创建时间
    lastLoginAt: string; // 最后登录时间
    status: string; // 用户状态
    role: string; // 用户角色
}

/**
 * 用户视图对象分页接口
 * 包含用户列表和总数，用于分页展示
 */
export interface UserVOPage {
    total: number; // 用户总数
    data: UserVO[]; // 用户列表数据
}

/**
 * 简单用户信息响应接口
 */
export interface SimpleUserInfoResponse extends ApiResponse<SimpleUserInfo[]> {}

/**
 * 用户视图对象响应接口
 */
export interface UserVOResponse extends ApiResponse<UserVO> {}

/**
 * 用户视图对象分页响应接口
 */
export interface UserVOPageResponse extends ApiResponse<UserVOPage> {}

/**
 * 根据用户ID获取简单用户信息
 * @param {number[]} userIds - 用户ID数组
 * @returns {Promise<SimpleUserInfoResponse>} 简单用户信息响应
 */
export const usersGetSimpleUsersInfo = async (
    userIds: number[]
): Promise<SimpleUserInfoResponse> => {
    return Request.get<SimpleUserInfoResponse>('/api/users/simple', { userIds });
};

/**
 * 根据用户ID获取详细用户信息
 * @param {number} userId - 用户ID
 * @returns {Promise<UserVOResponse>} 用户视图对象响应
 */
export const usersGetDetailedUserInfo = async (userId: number): Promise<UserVOResponse> => {
    return Request.get<UserVOResponse>(`/api/users/${userId}`);
};

/**
 * 用户注册
 * @param {string} name - 用户昵称
 * @param {string} email - 用户邮箱
 * @param {string} password - 用户密码
 * @param {string} [inviteCode] - 邀请码（可选）
 * @returns {Promise<ApiResponse>} 注册结果响应
 */
export const usersSignOn = async (
    name: string,
    email: string,
    password: string,
    inviteCode?: string
): Promise<ApiResponse> => {
    return Request.post<ApiResponse>('/api/users/', { name, email, password, inviteCode });
};

/**
 * 更新用户资料（需要认证）
 * @param {UserProfile} profile - 用户资料对象
 * @returns {Promise<ApiResponse>} 更新结果响应
 */
export const usersUpdateProfileAuth = async (profile: UserProfile): Promise<ApiResponse> => {
    return Request.put_auth<ApiResponse>('/api/users/', profile);
};

/**
 * 修改用户密码（需要认证）
 * @param {string} oldPassword - 旧密码
 * @param {string} newPassword - 新密码
 * @returns {Promise<ApiResponse>} 修改结果响应
 */
export const usersChangePasswordAuth = async (
    oldPassword: string,
    newPassword: string
): Promise<ApiResponse> => {
    return Request.put_auth<ApiResponse>('/api/users/changePassword', { oldPassword, newPassword });
};

/**
 * 管理员获取所有用户（分页）
 * @param {number} page - 页码
 * @param {number} pageSize - 每页大小
 * @returns {Promise<UserVOPageResponse>} 用户分页响应
 */
export const usersAdminGetUsersByPage = async (
    page: number,
    pageSize: number
): Promise<UserVOPageResponse> => {
    return Request.get_auth<UserVOPageResponse>('/api/users/admin', { page, pageSize });
};

/**
 * 管理员设置用户角色
 * @param {number} userId - 用户ID
 * @param {string} role - 角色名称
 * @returns {Promise<ApiResponse>} 设置结果响应
 */
export const usersAdminSetUserRole = async (
    userId: number,
    role: UserRole
): Promise<ApiResponse> => {
    return Request.put<ApiResponse>(`/api/users/admin/${userId}/role`, { userId, role });
};

/**
 * 管理员设置用户状态
 * @param {number} userId - 用户ID
 * @param {string} status - 状态名称
 * @returns {Promise<ApiResponse>} 设置结果响应
 */
export const usersAdminSetUserStatus = async (
    userId: number,
    status: UserStatus
): Promise<ApiResponse> => {
    return Request.put<ApiResponse>(`/api/users/admin/${userId}/status`, { userId, status });
};

/**
 * 管理员重置用户密码
 * @param {number} userId - 用户ID
 * @returns {Promise<ApiResponse>} 重置结果响应
 */
export const usersAdminResetUserPassword = async (userId: number): Promise<ApiResponse> => {
    return Request.put_auth<ApiResponse>(`/api/users/admin/${userId}/reset`, { userId });
};
