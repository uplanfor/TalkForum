/**
 * 个人中心页面组件
 * 展示用户个人信息和发布的帖子，包含：
 * - 导航栏
 * - 个人信息背景
 * - 帖子容器
 */
import Nav from '../components/Nav';
import InfoBackground from '../components/InfoBackground';
import PostContainer, { PostContainerTargetType } from '../components/PostsContainer';
import { InfoBackgroundType } from '../constants/default';
import { useSelector } from 'react-redux';
import { type RootState } from '../store';

/**
 * 个人中心页面组件
 * 展示用户个人信息和发布的帖子
 */
const Me = () => {
    // 从Redux获取当前登录用户的ID
    const selfId = useSelector((state: RootState) => state.user.id);

    return (
        <>
            {/* 导航栏组件 */}
            <Nav />

            {/* 个人信息背景组件，显示用户自己的信息 */}
            <InfoBackground targetType={InfoBackgroundType.SELF}></InfoBackground>

            {/* 帖子容器组件，展示用户发布的帖子 */}
            <PostContainer targetType={PostContainerTargetType.SELF} targetId={selfId} />
        </>
    );
};

export default Me;
