/**
 * 帖子卡片占位组件
 * 用于帖子加载过程中显示的骨架屏效果
 */
import './styles/style_postcardplaceholder.css';

/**
 * 帖子卡片占位组件
 * 显示帖子卡片的骨架屏，用于加载状态
 */
const PostCardPlaceholder = () => {
    return (
        <div className='post-card skeleton'>
            {/* 作者信息占位 */}
            <div className='author-info'>
                <div className='skeleton-avatar' />
                <div className='author-info-text'>
                    <div className='skeleton-text skeleton-text-name' />
                    <div className='skeleton-text skeleton-text-date' />
                </div>
            </div>

            {/* 帖子标题占位 */}
            <div className='skeleton-text skeleton-title' />
            {/* 帖子内容占位 */}
            <div className='skeleton-text skeleton-content' />

            {/* 帖子统计信息占位 */}
            <div className='detail'>
                <span className='skeleton-stat' />
                <span className='skeleton-stat' />
                <span className='skeleton-stat' />
            </div>
        </div>
    );
};

export default PostCardPlaceholder;
