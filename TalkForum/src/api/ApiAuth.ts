import type ApiResponse from "./ApiResponse";
import Request from "../utils/Request";

export interface UserInfo {
    id: number;
    email: string;
    name: string;
    role : string;
    intro: string;
    avatarLink: string;
    backgroundLink: string;
    lastLoginAt?: string;
    isLoggedIn: boolean;
    fansCount: number;
}

export interface AuthResponse extends ApiResponse<UserInfo> {}
/*
 * to login
*/
export const authSignIn = (nameOrEmail: string, password: string) : Promise<AuthResponse> => {
    return Request.post<AuthResponse>("/api/auth/login", {
        nameOrEmail,
        password,
    });
}

/*
 * to logout
*/
export const authSignOut = () : Promise<any> => {
    return Request.post("/api/auth/logout");
}

/*
 * to get user info
*/
export const authGetLoginInfo = () : Promise<AuthResponse> => {
    return Request.get<AuthResponse>("/api/auth/");
}