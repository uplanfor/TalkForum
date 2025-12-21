/**
 * 用户信息小型组件
 * 显示用户的登录状态、用户名、头像，以及登录/登出、设置、个人资料等功能
 */
// import "../assets/normalize.css"
import './styles/style_userinfosmall.css';

import { useDispatch, useSelector } from 'react-redux';
import { type RootState, type AppDispatch } from '../store';
import { userLogout } from '../store/slices/userSlice';
import SettingDialog from './SettingDialog';
import ProfileDialog from './ProfileDialog';
// import { userLogin } from "../store/slices/userSlice";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import Msg from '../utils/msg';
import { authSignOut } from '../api/ApiAuth';
import { useTranslation } from 'react-i18next';

/**
 * 用户信息小型组件属性接口
 */
interface UserInfoSmallProps {
    /**
     * 自定义样式（可选）
     */
    style?: React.CSSProperties;
}

/**
 * 用户信息小型组件
 * 显示用户的登录状态、用户名、头像，以及登录/登出、设置、个人资料等功能
 */
const UserInfoSmall = ({ style }: UserInfoSmallProps) => {
    // Redux dispatch钩子
    const dispatch = useDispatch<AppDispatch>();

    // 国际化钩子
    const { t } = useTranslation();

    // 从Redux获取用户信息
    const { isLoggedIn, name, avatarLink } = useSelector((state: RootState) => state.user);

    // 设置对话框可见性状态
    const [settingDialogVisible, setSettingDialogVisible] = useState(false);

    // 个人资料对话框可见性状态
    const [profileDialogVisible, setProfileDialogVisible] = useState(false);

    // 路由导航钩子
    const navigate = useNavigate();

    /**
     * 跳转到登录页面
     */
    const toLogin = () => {
        navigate('/login');
    };

    /**
     * 用户登出处理函数
     * 调用API登出，然后更新Redux状态
     */
    const toSignOut = async () => {
        await authSignOut();
        dispatch(userLogout());
        Msg.success('Sign out successfully');
    };

    return (
        <>
            {/* 用户信息小型组件主容器 */}
            <div
                className={`user-info-small ${isLoggedIn ? 'logged-in' : 'logged-out'}`}
                style={style}
            >
                {/* 登录状态显示用户名，未登录显示登录按钮 */}
                {isLoggedIn ? (
                    <span>{name}</span>
                ) : (
                    <button className='login-button' onClick={toLogin}>
                        {t('nav.login')}
                    </button>
                )}

                {/* 用户头像 */}
                <div className='img-t'>
                    <img src={avatarLink} alt='Failed' />
                </div>

                {/* 已登录用户显示菜单 */}
                {isLoggedIn && (
                    <ul className='menu'>
                        <li onClick={() => setProfileDialogVisible(true)}>My Profile</li>
                        <li onClick={() => setSettingDialogVisible(true)}>Settings</li>
                        <li onClick={toSignOut}>Sign Out</li>
                    </ul>
                )}
            </div>

            {/* 设置对话框，使用React Portal渲染到body节点以避免遮挡问题 */}
            {settingDialogVisible &&
                createPortal(
                    <SettingDialog onClose={() => setSettingDialogVisible(false)} />,
                    document.body
                )}

            {/* 个人资料对话框，使用React Portal渲染到body节点以避免遮挡问题 */}
            {profileDialogVisible &&
                createPortal(
                    <ProfileDialog onClose={() => setProfileDialogVisible(false)} />,
                    document.body
                )}
        </>
    );
};

export default UserInfoSmall;
