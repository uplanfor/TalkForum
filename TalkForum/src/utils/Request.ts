import axios, {
    type AxiosRequestConfig,

    type InternalAxiosRequestConfig,
} from 'axios';
import { LanguageUtil } from './LanguageUtil';
import qs from 'qs';

/**
 * API响应通用接口
 * 定义了所有API返回的统一格式
 * @template T - 响应数据的类型
 */
export interface ApiResponse<T = any> {
    code: number; // 响应状态码
    success: boolean; // 请求是否成功
    message: string; // 响应消息
    data: T; // 响应数据，支持泛型
}


const myAxiosInstance = axios.create({
    timeout: 10000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Accept-Language': LanguageUtil.getCurrentLanguage(),
    },

    paramsSerializer: {
        serialize: (params) => {
            // arrayFormat: 'repeat' 表示数组序列化为 userIds=1&userIds=2
            return qs.stringify(params, { arrayFormat: 'repeat' });
        }
    }
})

myAxiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const currentLang = LanguageUtil.getCurrentLanguage();
        config.headers = config.headers || {};
        config.headers['Accept-Language'] = currentLang;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

myAxiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(new Error(error.response?.data?.message || error.message || 'Request Error'));
    }

)

async function sendAnyRequest<T>(
    method: AxiosRequestConfig['method'],
    url: string,
    data?: Record<string, any>,
    isAuth: boolean = false) {
    try {
        const res = await myAxiosInstance.request<T>({
            method,
            url,
            ...(['get', 'delete'].includes(method?.toLowerCase() || '')
                ? { params: data }
                : { data: data }),
        })

        if (isAuth && (res.data as ApiResponse<T>).code === 401) {
            throw new Error((res.data as ApiResponse<T>).message);
        }

        return res.data;
    } catch (error) {
        throw error;
    }
}


const Request = {
    get: async <T = any>(url: string, data?: Record<string, any>) => {
        return sendAnyRequest<T>('get', url, data);
    },
    post: async <T = any>(url: string, data?: Record<string, any>) => {
        return sendAnyRequest<T>('post', url, data);
    },
    put: async <T = any>(url: string, data?: Record<string, any>) => {
        return sendAnyRequest<T>('put', url, data);
    },
    delete: async <T = any>(url: string, data?: Record<string, any>) => {
        return sendAnyRequest<T>('delete', url, data);
    },
    getAuth: async <T = any>(url: string, data?: Record<string, any>) => {
        return sendAnyRequest<T>('get', url, data, true);
    },
    postAuth: async <T = any>(url: string, data?: Record<string, any>) => {
        return sendAnyRequest<T>('post', url, data, true);
    },
    putAuth: async <T = any>(url: string, data?: Record<string, any>) => {
        return sendAnyRequest<T>('put', url, data, true);
    },
    deleteAuth: async <T = any>(url: string, data?: Record<string, any>) => {
        return sendAnyRequest<T>('delete', url, data, true);
    }
}

export default Request;