/**
 * 管理员首页组件
 * 显示管理员仪表盘，包括欢迎信息和统计数据
 */
import './styles/style_adminhome.css';

import { useSelector } from 'react-redux';
import { type RootState } from '../store';
import { useEffect, useState } from 'react';
import { authGetAdminHomeInfo, type AdminHomeInfo } from '../api/ApiAuth';
import Msg from '../utils/msg';
import { useTranslation } from 'react-i18next';

/**
 * 管理员首页组件
 * 显示管理员仪表盘，包括欢迎信息和统计数据
 */
const AdminHome = () => {
    // 从Redux store获取当前用户信息
    const user = useSelector((state: RootState) => state.user);
    const { t } = useTranslation();
    let [adminHomeInfo, setAdminHomeInfo] = useState<AdminHomeInfo>({
        totalUsers: 0,
        totalPosts: 0,
        totalReports: 0,
        postsNotHandled: 0,
        commentsNotHandled: 0,
        reportsNotHandled: 0,
    });

    // 判断当前时间，显示相应的问候语
    const time = new Date().getHours();
    let greeting = '';
    if (time >= 6 && time < 12) {
        greeting = t('adminHome.goodMorning');
    } else if (time >= 12 && time < 18) {
        greeting = t('adminHome.goodAfternoon');
    } else {
        greeting = t('adminHome.goodEvening');
    }

    useEffect(() => {
        (async () => {
            await authGetAdminHomeInfo()
                .then(res => {
                    if (res.success) {
                        setAdminHomeInfo(res.data);
                    } else {
                        throw new Error(res.message);
                    }
                })
                .catch(err => {
                    Msg.error(err.message);
                });
        })();
    }, []);

    return (
        <div className='admin-home'>
            {/* 欢迎信息区域 */}
            <div className='admin-home-greeting'>
                {/* 动态问候语 */}
                <h1>
                    {greeting}, <span style={{ color: 'var(--primary)' }}>{user.name}</span> !
                </h1>
                {/* 欢迎描述 */}
                <p>{t('adminHome.welcomeMessage')}</p>
            </div>

            {/* 统计数据区域 */}
            <div className='admin-home-status'>
                {/* 用户总数 */}
                <div className='admin-home-status-item'>
                    <h2>{t('adminHome.totalUsers')}</h2>
                    <p>{adminHomeInfo.totalUsers}</p>
                </div>

                {/* 帖子总数 */}
                <div className='admin-home-status-item'>
                    <h2>{t('adminHome.totalPosts')}</h2>
                    <p>{adminHomeInfo.totalPosts}</p>
                </div>

                {/* 举报总数 */}
                <div className='admin-home-status-item'>
                    <h2>{t('adminHome.totalReports')}</h2>
                    <p>{adminHomeInfo.totalReports}</p>
                </div>

                {/* 未处理帖子数 */}
                <div className='admin-home-status-item'>
                    <h2>{t('adminHome.postsNotHandled')}</h2>
                    <p>{adminHomeInfo.postsNotHandled}</p>
                </div>

                {/* 未处理评论数 */}
                <div className='admin-home-status-item'>
                    <h2>{t('adminHome.commentsNotHandled')}</h2>
                    <p>{adminHomeInfo.commentsNotHandled}</p>
                </div>

                {/* 未处理举报数 */}
                <div className='admin-home-status-item'>
                    <h2>{t('adminHome.reportsNotHandled')}</h2>
                    <p>{adminHomeInfo.reportsNotHandled}</p>
                </div>
            </div>
        </div>
    );
};

export default AdminHome;
