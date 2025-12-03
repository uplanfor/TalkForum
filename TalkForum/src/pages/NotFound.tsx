/**
 * 404页面组件
 * 当用户访问不存在的页面时显示，包含：
 * - 导航栏
 * - 404错误信息
 * - 自动跳转到首页的倒计时功能
 */
import "../assets/normalize.css"
import Nav from "../components/Nav";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"

/**
 * 404页面组件
 * 当用户访问不存在的页面时显示，并在5秒后自动跳转到首页
 */
const NotFound = () => {
    // 倒计时总时长（秒）
    const time = 5;
    // 倒计时状态
    const [countDown, setCountDown] = useState(time);
    // 路由导航钩子
    const navigate = useNavigate();

    /**
     * 倒计时逻辑
     * - 每秒更新一次倒计时
     * - 倒计时结束后自动跳转到首页
     * - 组件卸载时清除定时器，避免内存泄漏
     */
    useEffect(() => {
        // 创建定时器，每秒执行一次
        const timer = setInterval(() => {
            setCountDown(prev => {
                if (prev === 1) { // 当倒计时到1时，下一秒直接跳转
                    clearInterval(timer); // 清除定时器
                    navigate("/"); // 跳转到首页
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // 组件卸载时清除定时器（避免内存泄漏）
        return () => clearInterval(timer);
    }, [navigate]);

    return <>
        <Nav />
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 100px)',
            padding: '20px',
            textAlign: 'center'
        }}>
            <h1>Page Not Found</h1>
            <p>We will go to the home page in {countDown} seconds.</p>
        </div>
    </>;
};

export default NotFound;    