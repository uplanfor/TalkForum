import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';

// 扩展Axios请求配置
interface RequestConfig extends AxiosRequestConfig {
  headers?: {
    'X-Auth-Required'?: boolean;
    [key: string]: any;
  };
}

// 扩展AxiosError类型，增加自定义message
interface CustomAxiosError extends AxiosError {
  customMessage?: string;
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

    // 响应拦截器：直接返回数据 + 统一处理错误信息
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: CustomAxiosError) => {
        // 1. 处理认证失败（401）
        if (error.config?.headers?.['X-Auth-Required'] === true && 
            error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
        }

        // 2. 统一处理错误信息：优先使用接口返回的message，无则用默认提示
        const defaultMessage = 'Request Failed, please try again later!';
        let errorMessage = defaultMessage;

        // 有响应数据的情况（接口返回了错误状态码）
        if (error.response) {
          // 优先取接口返回的message
          errorMessage = (error.response.data as any)?.message || 
                          // 备用：HTTP状态文本（如404 Not Found）
                          error.response.statusText || 
                          defaultMessage;
        }
        // 无响应数据的情况（网络错误、超时等）
        else if (error.request) {
          errorMessage = error.message || defaultMessage;
        }
        // 其他错误（请求配置错误等）
        else {
          errorMessage = `Request Configuration Error:${error.message}` || defaultMessage;
        }

        // 将处理后的错误信息挂载到error对象上
        error.customMessage = errorMessage;
        // 也可以直接覆盖原始message（根据需求二选一）
        error.message = errorMessage;

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

    try {
      const response = await this.instance.request<T>(config);
      return response.data;
    } catch (error) {
      // 统一抛出处理后的错误（可选：这里也可以直接throw，让业务层catch）
      const err = error as CustomAxiosError;
      throw new Error(err.customMessage || err.message || 'Request failed, please try again later!');
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