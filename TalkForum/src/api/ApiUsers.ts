import type ApiResponse from "./ApiResponse";
import Request from "../utils/Request";

export interface SimpleUserInfo {
  avatarLink: string;
  name: string;
}

export interface UserProfile {
    name: string;
    intro: string;
    avatarLink: string;
    backgroundLink: string;
}

export interface UserVO {
    id: number;
    name: string;
    email: string;
    intro: string;
    fansCount: number;
    followingCount: number;
    avatarLink: string;
    backgroundLink: string;
    createdAt: string;
    lastLoginAt: string;
    status: string;
    role: string;
}

export interface UserVOPage {
    total: number;
    data: UserVO[];
}
export interface SimpleUserInfoResponse extends ApiResponse<SimpleUserInfo[]> {}
export interface UserVOPageResponse extends ApiResponse<UserVOPage> {}

/*
 * Get simple user info by user ids
 */
export const usersGetSimpleUsersInfo = async (userIds: number[]): Promise<SimpleUserInfoResponse> => {
    return Request.get<SimpleUserInfoResponse>("/api/users/simple", {userIds});
}

/*
 * Make the user to sign on
 */
export const usersSignOn = async (name: string, email: string, password: string, inviteCode?: string): Promise<ApiResponse> => {
    return Request.post<ApiResponse>("/api/users/", {name, email, password, inviteCode});
}

/*
 * Make the user update profile
 */
export const usersUpdateProfileAuth = async (profile: UserProfile): Promise<ApiResponse> => {
    return Request.put_auth<ApiResponse>("/api/users/", profile);
}

/*
 * Change the user password
 */
export const usersChangePasswordAuth = async (oldPassword: string, newPassword: string): Promise<ApiResponse> => {
    return Request.put_auth<ApiResponse>("/api/users/changePassword", {oldPassword, newPassword});
}


/*
 * Admin to get all users
 */
export const usersAdminGetUsersByPage = async (page: number, pageSize: number): Promise<UserVOPageResponse> => {
    return Request.get_auth<UserVOPageResponse>("/api/users/admin/all", {page, pageSize});
}

/*
 * Admin to set user role
 */
export const usersAdminSetUserRole = async (userId: number, role: string): Promise<ApiResponse> => {
    return Request.put<ApiResponse>(`/api/users/admin/${userId}/role`, {userId, role});
}

/*
 * Admin to set user status
 */
export const usersAdminSetUserStatus = async (userId: number, status: string): Promise<ApiResponse> => {
    return Request.put<ApiResponse>(`/api/users/admin/${userId}/status`, {userId, status});
}

/*
 * Admin to reset user's password
 */
export const usersAdminResetUserPassword = async (userId: number): Promise<ApiResponse> => {
    return Request.put_auth<ApiResponse>(`/api/users/admin/${userId}/reset`, {userId});
}