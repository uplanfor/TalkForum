/**
 * 首页组件
 * 论坛的主页面，包含：
 * - 导航栏
 * - 背景图片
 * - 帖子容器（支持最新和精华两个标签页）
 */
import Nav from "../components/Nav";
import BackgroundImg from "../components/BackgroundImg";
import PostsContainer, { PostContainerTargetType } from "../components/PostsContainer";
import { DefaultBackgroundUrl } from "../constants/default";
// import KeepAlive from "react-activation";

/**
 * 首页组件
 * 论坛的主页面，展示最新和精华帖子
 */
const Home = () => (
    <>
        {/* 导航栏组件 */}
        <Nav></Nav>
        
        {/* 背景图片组件，使用默认背景图URL */}
        <BackgroundImg src={DefaultBackgroundUrl} >
            <div style={{
                position: "absolute", top: "50%", left: "50%", textAlign: "center",
                transform: "translate(-50%, -50%)", width: "fit-content", height: "fit-content",
                fontSize: "2rem", color: "white", fontWeight: "bold",}}>
                Talk anywhere!
                <p style={{fontSize: "1rem", fontWeight: "normal"}}>Talk as you like!</p>
            </div>
        </BackgroundImg>
        {/* <BackgroundImg src="https://bing.img.run/1366x768.php" /> */}

        {/* 帖子容器组件，首页模式，支持最新、精华和关注标签页 */}
        <PostsContainer targetType={PostContainerTargetType.HOME} />
    </>
);


export default Home;