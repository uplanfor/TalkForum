/**
 * 举报相关API请求
 * 包含提交举报、管理员获取举报列表以及处理举报等功能
 */
import type ApiResponse from "./ApiResponse";
import Request from "../utils/Request";

/**
 * 举报接口
 * 包含举报的详细信息
 */
export interface Report {
    id: number;             // 举报ID
    userId: number;         // 举报人ID
    reportType: string;     // 举报类型
    reportTargetType: string; // 举报目标类型（如帖子、评论、用户等）
    reportTarget: string;   // 举报目标ID
    reason: string;         // 举报原因
    createdAt: string;      // 举报时间
    handledAt: string | null; // 处理时间（未处理则为null）
    handledBy: number | null; // 处理人ID（未处理则为null）
}

/**
 * 举报分页接口
 * 包含举报列表和总数，用于分页展示
 */
export interface ReportPage {
    data: Report[];         // 举报数据数组
    total: number;          // 举报总数
}

/**
 * 提交举报
 * @param {string} reportType - 举报类型
 * @param {string} reportTargetType - 举报目标类型
 * @param {string} reportTarget - 举报目标ID
 * @param {string} [reason] - 举报原因（可选）
 * @returns {Promise<ApiResponse>} 提交结果响应
 */
export const reportsPostReport = async (reportType: string, reportTargetType: string, reportTarget: string, reason?: string) => {
    return Request.post<ApiResponse>(`/api/reports/`, { 
        reportType, reportTargetType, reportTarget, reason });
}

/**
 * 管理员获取举报列表（分页）
 * @param {number} page - 页码
 * @param {number} pageSize - 每页大小
 * @returns {Promise<ApiResponse>} 举报列表响应
 */
export const reportsAdminGetReports = async (page: number, pageSize: number) => {
    return Request.get_auth<ApiResponse>(`/api/reports/admin?page=${page}&pageSize=${pageSize}`);
}

/**
 * 管理员处理举报
 * @param {number[]} reportIds - 举报ID数组
 * @param {number} handledBy - 处理人ID
 * @param {string} status - 处理结果状态
 * @returns {Promise<ApiResponse>} 处理结果响应
 */
export const reportsAdminHandleReport = async (reportIds: number[], handledBy: number, status: string) => {
    return Request.put_auth<ApiResponse>(`/api/reports/admin`, { reportIds, handledBy, status });
}