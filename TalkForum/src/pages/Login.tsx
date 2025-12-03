/**
 * 登录/注册页面组件
 * 处理用户登录和注册功能，包含：
 * - 登录表单
 * - 注册表单
 * - 表单切换功能
 * - 表单验证
 * - 登录状态检查
 */
import "../assets/normalize.css"
import React, { useEffect } from "react";
import "./styles/style_login.css";
import { useNavigate } from "react-router-dom";
import Msg from '../utils/msg.ts';

// Redux相关导入
import { useDispatch } from 'react-redux';
import { userLogin } from '../store/slices/userSlice';
import { type AppDispatch } from '../store'; // 导入类型定义

// API相关导入
import { authGetLoginInfo, authSignIn } from "../api/ApiAuth.ts";
import { usersSignOn } from "../api/ApiUsers.ts";

/**
 * 登录/注册页面组件
 * 处理用户登录和注册功能
 */
const Login = () => {
  // 控制当前显示的是登录表单还是注册表单
  const [isLogin, setIsLogin] = React.useState(true);
  // 路由导航钩子
  const navigate = useNavigate();
  // Redux dispatch钩子
  const dispatch = useDispatch<AppDispatch>();

  /**
   * 组件挂载时检查用户登录状态
   * - 检查浏览器是否支持cookie
   * - 调用API检查用户是否已登录，如果已登录则跳转到首页
   */
  useEffect(() => {
    (async () => {
      // 判断用户是否支持cookie
      if (!navigator.cookieEnabled) {
        Msg.error("Please enable cookies to use TalkForum!", 3000);
        return;
      }
      // 判断用户是否登录
      try {
        const res = await authGetLoginInfo();
        if (res.success) {
          // 已登录，跳转到首页
          navigate("/");
        }
      } catch (error) {
        // 忽略错误，继续显示登录页面
      }
    })()
  }, []);

  // 表单数据状态管理
  const [formData, setFormData] = React.useState({
    username: "",       // 登录/注册共用
    email: "",          // 仅注册
    password: "",       // 登录/注册共用（保留值）
    confirmPassword: "",// 仅注册
    inviteCode: ""      // 仅注册（可选）
  });

  /**
   * 输入框变更事件处理函数
   * 实时更新表单数据状态
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * 切换表单状态（登录 ↔ 注册）
   * 保留共用字段值，清空非共用字段
   */
  const toggleForm = () => {
    setIsLogin(prev => !prev);
    // 切换时保留 username 和 password（共用字段），清空其他非共用字段
    setFormData(prev => ({
      ...prev,
      email: "",          // 切换到登录时清空邮箱
      confirmPassword: "",// 切换到登录时清空确认密码
      // inviteCode: ""    // 可选：切换时是否保留邀请码，根据需求决定
    }));
  };

  /**
   * 表单验证函数
   * - 登录表单：验证用户名/邮箱和密码非空
   * - 注册表单：验证所有必填字段非空，密码一致性
   * @returns {boolean} 验证是否通过
   */
  const validateForm = (): boolean => {
    const { username, email, password, confirmPassword } = formData;

    // 登录表单校验（用户名/邮箱 + 密码非空）
    if (isLogin) {
      if (!username.trim()) {
        Msg.error("Username or Email cannot be empty!", 3000);
        return false;
      }
      if (!password.trim()) {
        Msg.error("Password cannot be empty!", 3000);
        return false;
      }
    }
    // 注册表单校验（非空 + 密码一致性）
    else {
      if (!username.trim()) {
        Msg.error("Username cannot be empty!", 3000);
        return false;
      }
      if (!email.trim()) {
        Msg.error("Email cannot be empty!", 3000);
        return false;
      }
      if (!password.trim()) {
        Msg.error("Password cannot be empty!", 3000);
        return false;
      }
      if (password.trim() !== confirmPassword.trim()) {
        Msg.error("Passwords do not match!", 3000);
        return false;
      }
      // 邀请码可选，无需校验
    }
    return true;
  };

  /**
   * 表单提交处理函数
   * - 验证表单
   * - 根据当前表单类型调用相应的API
   * - 处理API返回结果
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 先做表单校验，失败直接返回
    if (!validateForm()) return;

    try {
      if (isLogin) {
        // 登录请求：从状态中获取数据
        const res = await authSignIn(formData.username, formData.password);
        if (res.success) {
          Msg.success('Sign in successfully!');
          console.log(res.data)
          // 将用户信息写入Redux store
          dispatch(userLogin(res.data));
          navigate("/"); // 跳转到首页
        } else {
          Msg.error(res.message || 'Sign in failed!', 3000);
        }
      } else {
        // 注册请求：构造注册参数
        const res = await usersSignOn(formData.username, formData.email, formData.password, formData.inviteCode.trim() || undefined);
        if (res.success) {
          Msg.success('Sign up successfully! Please sign in!', 3000);
          setIsLogin(true); // 切换到登录表单
          // 清空确认密码，保留用户名和密码，方便用户直接登录
          setFormData(prev => ({ ...prev, confirmPassword: "" }));
        } else {
          Msg.error(res.message || 'Sign up failed!', 3000);
        }
      }
    } catch (error) {
      console.error('Login/Register failed:', error);
      Msg.error(isLogin ? 'Failed to sign in' : 'Failed to sign up', 3000);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>{isLogin ? "Sign in to TalkForum" : "Sign up to TalkForum"}</h2>
        <form onSubmit={handleSubmit} autoComplete="off">
          {isLogin ? (
            // 登录表单：仅显示 用户名/邮箱 + 密码（共用字段保留值）
            <>
              <div className="form-group">
                <label htmlFor="username">Username or Email</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username} // 绑定状态
                  onChange={handleInputChange} // 绑定变更事件
                  placeholder="Enter username or email"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password} // 绑定状态（切换时保留值）
                  onChange={handleInputChange}
                  placeholder="Enter password"
                />
              </div>
            </>
          ) : (
            // 注册表单：显示所有字段（密码字段绑定同一状态，保留值）
            <>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username} // 共用字段，切换时保留
                  onChange={handleInputChange}
                  placeholder="Enter username"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email} // 仅注册字段，切换时清空
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password} // 共用字段，切换时保留
                  onChange={handleInputChange}
                  placeholder="Enter password (8-32 characters)"
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <input
                  type="password"
                  id="confirm-password"
                  name="confirmPassword"
                  value={formData.confirmPassword} // 仅注册字段
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                />
              </div>
              <div className="form-group">
                <label htmlFor="invite-code">Invite Code (optional)</label>
                <input
                  type="text"
                  id="invite-code"
                  name="inviteCode"
                  value={formData.inviteCode} // 仅注册字段
                  onChange={handleInputChange}
                  placeholder="Enter invite code (if any)"
                />
              </div>
            </>
          )}
          <button type="submit" className="submit-btn">
            {isLogin ? "Sign in" : "Sign up"}
          </button>
        </form>
        <p className="toggle-form">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={toggleForm} // 调用切换逻辑（保留密码）
            className="toggle-btn"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;