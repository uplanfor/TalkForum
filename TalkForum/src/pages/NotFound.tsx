import "../assets/normalise.css"
import Nav from "../components/Nav";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"


const NotFound = () => {
    const time = 5;
    const [countDown, setCountDown] = useState(time);
    const navigate = useNavigate();

    useEffect(() => {
        // 2. 用useEffect包裹定时器，确保只创建一次（依赖项为空数组）
        const timer = setInterval(() => {
            setCountDown(prev => {
                if (prev === 1) { // 3. 当倒计时到1时，下一秒直接跳转并清除定时器
                    clearInterval(timer); // 清除定时器
                    navigate("/"); // 正确调用导航函数
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // 4. 组件卸载时清除定时器（避免内存泄漏）
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