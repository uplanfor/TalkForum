/**
 * API响应通用接口
 * 定义了所有API返回的统一格式
 * @template T - 响应数据的类型
 */
export default interface ApiResponse<T = any> {
    code: number; // 响应状态码
    success: boolean; // 请求是否成功
    message: string; // 响应消息
    data: T; // 响应数据，支持泛型
}
