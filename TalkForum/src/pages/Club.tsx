/**
 * 俱乐部页面组件
 * 用于展示用户关注的俱乐部和相关内容，包含：
 * - 导航栏
 * - 功能卡片区域
 * - 关注的俱乐部列表
 * - 俱乐部最新帖子
 */
import PostContainer, { PostContainerTargetType } from "../components/PostsContainer";
import Nav from "../components/Nav";
import { useTranslation } from "react-i18next";
import "../assets/normalize.css"
import "./styles/style_club.css"

/**
 * 俱乐部页面组件
 * 展示用户关注的俱乐部和相关内容
 */
const Club = () => {
    const { t } = useTranslation();
    
    return <>
        {/* 导航栏组件 */}
        <Nav />
        
        {/* 功能卡片区域 */}
        <div className="functions">
            <div className="function-card">
                <h1>{t('club.appsTitle')}</h1>
                <p>{t('club.appsDescription')}</p>
            </div>
            <div className="function-card">
                <h1>{t('club.clubsTitle')}</h1>
                <p>{t('club.clubsDescription')}</p>
            </div>
        </div>
        
        {/* 关注的俱乐部区域 */}
        <div className="followed-clubs">
            <h2>{t('club.followedClubsTitle')}</h2>
            <ul className="club-list">
                {/* <li className="club-info">
                    <img src="https://pic1.imgdb.cn/item/6905cbfa3203f7be00bf6e98.webp" alt="Not Found" />
                    <p>Chicken Club</p>
                </li> */}
                <p className="center-text">{t('club.noFollowedClubs')}</p>
            </ul>
            <h2>{t('club.clubLatestTitle')}</h2>
        </div>
        
        {/* 帖子容器组件，展示俱乐部最新帖子 */}
        <PostContainer targetType={PostContainerTargetType.CLUB}/>
    </>
}

export default Club;