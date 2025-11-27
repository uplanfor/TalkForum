import "./assets/normalize.css"
import { Route, Routes, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import { useEffect, useState } from "react";
import store from "./store"
import Admin from './pages/Admin';
import Login from './pages/Login';
import Home from './pages/Home';
import Me from './pages/Me';
import NotFound from "./pages/NotFound";
import ThemeUtil from './utils/ThemeUtil';
import Mail from './pages/Mail';
import Club from './pages/Club';
import { useDispatch } from 'react-redux';
import { userLogout, userLogin } from './store/slices/userSlice';
import { type AppDispatch } from './store';
import { authGetLoginInfo } from "./api/ApiAuth";
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'


const NavigationScroll = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [location.pathname]);
  return null;
}

const RefreshLoginInfo = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let timer: number | undefined; // 浏览器环境中 setTimeout 返回 number 类型

    const fetchAuthInfo = async () => {
      try {
        const res = await authGetLoginInfo();

        if (res.success) {
          // 确保数据结构匹配 UserState，缺失字段用默认值兜底
          dispatch(userLogin(res.data));
        } else {
          dispatch(userLogout());
        }
      } catch (error) {
        if (retryCount < 1) {
          // 浏览器环境计时器，返回 number 类型
          timer = window.setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 5000);
        } else {
          dispatch(userLogout());
        }
      }
    };

    fetchAuthInfo();

    // 清理函数：清除定时器
    return () => {
      if (timer) {
        window.clearTimeout(timer); // 使用 window.clearTimeout 清除
      }
    };
  }, [dispatch, retryCount]);

  return null;
};



const App = () => {
  ThemeUtil.init();
  return (
    <Provider store={store}>
      <NavigationScroll />
      <RefreshLoginInfo />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/club" element={<Club />} />
        <Route path="/mail" element={<Mail />} />
        <Route path="/me" element={<Me />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        {/* <Route path="/post/:postId" element={<Post />} />
        <Route path="/space/:spaceType/:id" element={<Space />} /> */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Provider>
  )
}

export default App
