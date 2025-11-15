import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';

// 扩展Axios请求配置
interface RequestConfig extends AxiosRequestConfig {
  headers?: {
    'X-Auth-Required'?: boolean;
    [key: string]: any;
  };
}

class Request {
  private instance: AxiosInstance;

  constructor() {
    // 初始化axios实例
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || '',
      timeout: 10000,
      withCredentials: true, // 自动发送cookie
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
    });

    // 响应拦截器：直接返回数据
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        // 处理认证失败
        if (error.config?.headers?.['X-Auth-Required'] === true && 
            error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * 通用请求方法
   * @param method HTTP方法
   * @param url 请求地址
   * @param data 请求数据
   * @param isAuth 是否需要认证
   */
  private async request<T = any>(
    method: AxiosRequestConfig['method'],
    url: string,
    data: Record<string, any> = {},
    isAuth: boolean = false
  ): Promise<T> {
    const config: RequestConfig = {
      method,
      url,
      headers: isAuth ? { 'X-Auth-Required': true } : {},
      [method === 'get' || method === 'delete' ? 'params' : 'data']: data
    };

    const response = await this.instance.request<T>(config);
    return response.data;
  }

  // 基础HTTP方法
  get<T = any>(url: string, data?: Record<string, any>): Promise<T> {
    return this.request<T>('get', url, data);
  }

  post<T = any>(url: string, data?: Record<string, any>): Promise<T> {
    return this.request<T>('post', url, data);
  }

  put<T = any>(url: string, data?: Record<string, any>): Promise<T> {
    return this.request<T>('put', url, data);
  }

  delete<T = any>(url: string, data?: Record<string, any>): Promise<T> {
    return this.request<T>('delete', url, data);
  }

  // 带认证的HTTP方法
  get_auth<T = any>(url: string, data?: Record<string, any>): Promise<T> {
    return this.request<T>('get', url, data, true);
  }

  post_auth<T = any>(url: string, data?: Record<string, any>): Promise<T> {
    return this.request<T>('post', url, data, true);
  }

  put_auth<T = any>(url: string, data?: Record<string, any>): Promise<T> {
    return this.request<T>('put', url, data, true);
  }

  delete_auth<T = any>(url: string, data?: Record<string, any>): Promise<T> {
    return this.request<T>('delete', url, data, true);
  }
}

// 导出单例实例
export default new Request();
