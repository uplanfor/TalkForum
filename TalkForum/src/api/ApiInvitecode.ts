import type ApiResponse from "./ApiResponse";
import Request from "../utils/Request";

export interface Invitecode {
    code: string;
    creatorId: string;
    createdAt: string;
    expireAt: string;
    maxCount: number;
    usedCount: number;
}

export interface InvitecodePage {
    data: Invitecode[];
    total: number;
}


export interface GetInvitecodeResponse extends ApiResponse<Invitecode> {}
export interface InvitecodePageResponse extends ApiResponse<InvitecodePage> {}
export interface GenerateInvitecodeResponse extends ApiResponse<Invitecode[]> {}

export const getInvitecode = async (page: number, pageSize: number): Promise<GetInvitecodeResponse> => {
    return Request.get<GetInvitecodeResponse>("/api/invitecode/", { page, pageSize });
};


export const adminGetInvitecodeByPage = async (page: number, pageSize: number): Promise<InvitecodePageResponse> => {
    return Request.get<InvitecodePageResponse>("/api/invitecode/admin", { page, pageSize });
};

export const generateInvitecode = async (maxCount: number, expireDays: number, generateCount: number): Promise<GenerateInvitecodeResponse> => {
    return Request.post<GenerateInvitecodeResponse>("/api/invitecode/admin", { maxCount, expireDays, generateCount });
};