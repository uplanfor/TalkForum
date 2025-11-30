import type ApiResponse from "./ApiResponse";
import Request from "../utils/Request";

export interface Report {
    id: number;
    userId: number;
    reportType: string;
    reportTargetType: string;
    reportTarget: string;
    reason: string;
    createdAt: string;
    handledAt: string | null;
    handledBy: number | null;
}


export interface ReportPage {
    data: Report[];
    total: number;
}


export const reportsPostReport = async (reportType: string, reportTargetType: string, reportTarget: string, reason?: string) => {
    return Request.post<ApiResponse>(`/api/reports/`, { 
        reportType, reportTargetType, reportTarget, reason });
}


export const reportsAdminGetReports = async (page: number, pageSize: number) => {
    return Request.get_auth<ApiResponse>(`/api/reports/admin?page=${page}&pageSize=${pageSize}`);
}


export const reportsAdminHandleReport = async (reportIds: number[], handledBy: number, status: string) => {
    return Request.put_auth<ApiResponse>(`/api/reports/admin`, { reportIds, handledBy, status });
}