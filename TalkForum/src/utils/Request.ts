import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';

// 扩展Axios请求配置
interface RequestConfig extends AxiosRequestConfig {
  headers?: {
    'X-Auth-Required'?: boolean;
    [key: string]: any;
  };
}

// 通用响应格式
interface ApiResponse<T = any> {
  code: number | string;
  message: string;
  data: T;
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

    // 响应拦截器：处理认证
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse<any>>) => {
        return response.data.data; // 返回实际数据
      },
      (error: AxiosError<ApiResponse>) => {
        // 判断是否为需要认证的请求
        const isAuthRequest = error.config?.headers?.['X-Auth-Required'] === true;
        
        if (isAuthRequest && error.response) {
          const isUnauthorized = error.response.status === 401;
          const hasNoLoginCode = String(error.response.data?.code) === 'NO_LOGIN';
          if (isUnauthorized || hasNoLoginCode) {
            if (typeof window !== 'undefined') {
              window.location.href = '/'; // 跳转首页
            }
            return Promise.reject(new Error('Authentication required'));
          }
        }

        // 其他错误处理
        if (!error.response) {
          return Promise.reject(new Error('Network error'));
        }

        if (error.response.status >= 500) {
          return Promise.reject(new Error('Server error'));
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
      headers: {},
    };

    // 标记需要认证的请求
    if (isAuth) {
      if (config.headers) {
        config.headers['X-Auth-Required'] = true;
      }
    }

    // GET/DELETE使用params，POST/PUT使用data
    if (method === 'get' || method === 'delete') {
      config.params = data;
    } else {
      config.data = data;
    }

    try {
      const response = await this.instance.request<ApiResponse<T>>(config);
      // 返回实际数据
      return response.data.data as T;
    } catch (error) {
      console.error(`[${method?.toUpperCase()}] ${url} request failed:`, error);
      throw error;
    }
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
