/**
 * 俱乐部页面组件
 * 用于展示用户关注的俱乐部和相关内容，包含：
 * - 导航栏
 * - 功能卡片区域
 * - 关注的俱乐部列表
 * - 俱乐部最新帖子
 */
import PostContainer from "../components/PostsContainer";
import Nav from "../components/Nav";
import "../assets/normalize.css"
import "./styles/style_club.css"

/**
 * 俱乐部页面组件
 * 展示用户关注的俱乐部和相关内容
 */
const Club = () => {
    return <>
        {/* 导航栏组件 */}
        <Nav />
        
        {/* 功能卡片区域 */}
        <div className="functions">
            <div className="function-card">
                <h1>Apps</h1>
                <p>Explore Fun</p>
            </div>
            <div className="function-card">
                <h1>Clubs</h1>
                <p>Meet more like-minded people</p>
            </div>
        </div>
        
        {/* 关注的俱乐部区域 */}
        <div className="followed-clubs">
            <h2>Followed Clubs</h2>
            <ul className="club-list">
                {/* <li className="club-info">
                    <img src="https://pic1.imgdb.cn/item/6905cbfa3203f7be00bf6e98.webp" alt="Not Found" />
                    <p>Chicken Club</p>
                </li> */}
                <p className="center-text">You haven't followed any club yet.</p>
            </ul>
            <h2>Club Latest</h2>
        </div>
        
        {/* 帖子容器组件，展示俱乐部最新帖子 */}
        <PostContainer />
    </>
}

export default Club;