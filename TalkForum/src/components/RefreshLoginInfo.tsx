import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { useCallback, useEffect, useState } from "react";
import { authGetLoginInfo } from "../api/ApiAuth";
import { userLogin, userLogout } from "../store/slices/userSlice";

// 每次刷新要返回登录信息
const RefreshLoginInfo = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [retryCount, setRetryCount] = useState(0);

    useEffect(useCallback(() => {
        let timer: number | undefined;

        (async () => {
            try {
                const res = await authGetLoginInfo();
                if (res.success) {
                    // 确保数据结构匹配 UserState，缺失字段用默认值兜底
                    dispatch(userLogin(res.data));
                } else {
                    dispatch(userLogout());
                }
            } catch (error) {
                // if (retryCount < 1) {
                //   // 浏览器环境计时器，返回 number 类型
                //   timer = window.setTimeout(() => {
                //     setRetryCount(prev => prev + 1);
                //   }, 5000);
                // } else {
                //   dispatch(userLogout());
                // }
            }
        })();

        // 清理函数：清除定时器
        return () => {
            if (timer) {
                window.clearTimeout(timer); // 使用 window.clearTimeout 清除
            }
        };
    }, [retryCount]));

    return null;
};
export default RefreshLoginInfo;