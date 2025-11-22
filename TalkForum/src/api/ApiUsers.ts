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

export interface SimpleUserInfoResponse extends ApiResponse<SimpleUserInfo[]> {}

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
 * Chanage the user password
 */
export const usersChangePasswordAuth = async (oldPassword: string, newPassword: string): Promise<ApiResponse> => {
    return Request.put_auth<ApiResponse>("/api/users/changePassword", {oldPassword, newPassword});
}