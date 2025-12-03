/**
 * 认证相关API请求
 * 处理用户登录、登出和获取用户信息等功能
 */
import type ApiResponse from "./ApiResponse";
import Request from "../utils/Request";

/**
 * 用户信息接口
 * 定义了用户的基本信息结构
 */
export interface UserInfo {
    id: number;                    // 用户ID
    email: string;                 // 用户邮箱
    name: string;                  // 用户名
    role: string;                  // 用户角色
    intro: string;                 // 个人简介
    avatarLink: string;            // 头像链接
    backgroundLink: string;        // 背景图链接
    lastLoginAt?: string;          // 上次登录时间（可选）
    isLoggedIn: boolean;           // 是否已登录
    fansCount: number;             // 粉丝数量
    followingCount: number;        // 关注数量
}

/**
 * 认证响应接口
 * 扩展了ApiResponse接口，包含UserInfo类型的数据
 */
export interface AuthResponse extends ApiResponse<UserInfo> {}

/**
 * 用户登录
 * @param nameOrEmail 用户名或邮箱
 * @param password 密码
 * @returns 认证响应，包含用户信息
 */
export const authSignIn = (nameOrEmail: string, password: string) : Promise<AuthResponse> => {
    return Request.post<AuthResponse>("/api/auth/login", {
        nameOrEmail,
        password,
    });
}

/**
 * 用户登出
 * @returns 登出响应
 */
export const authSignOut = () : Promise<any> => {
    return Request.post("/api/auth/logout");
}

/**
 * 获取当前登录用户信息
 * @returns 认证响应，包含当前登录用户信息
 */
export const authGetLoginInfo = () : Promise<AuthResponse> => {
    return Request.get<AuthResponse>("/api/auth/");
}

/**
 * 获取管理员信息
 * @returns 认证响应，包含管理员信息
 */
export const authGetAdminInfo = () : Promise<AuthResponse> => {
    return Request.get<AuthResponse>("/api/auth/admin");
}