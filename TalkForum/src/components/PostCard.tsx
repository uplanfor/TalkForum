/**
 * 帖子卡片组件
 * 用于展示帖子的基本信息，包括标题、简介、作者、发布时间、浏览量、点赞数、评论数等
 * 支持查看详情、编辑、删除、分享、举报等功能
 */
// import "../assets/normalize.css"
import { useSelector } from "react-redux";
import { type RootState } from "../store";
import "./styles/style_postcard.css"
import { EyeIcon, HandThumbUpIcon, ChatBubbleBottomCenterIcon } from '@heroicons/react/24/outline';
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";
import dayjs from "dayjs";
import { SpaceViewType, UserType } from "../constants/default";
import { PostViewType } from "../constants/default";
import { getSingleSimpleUserInfo } from "../utils/simpleUserInfoCache";
import { copyToClipboard } from "../utils/clipboard";
import { postsAdminSetPostAsEssence, postsDeletePostAuth } from "../api/ApiPosts";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Msg from "../utils/msg";
import { INTERACT_POST, interactionMakeInteractionWithPost } from "../api/ApiInteractions";

/**
 * 帖子卡片组件属性接口
 */
export interface PostCardProps {
    title?: string;          // 帖子标题（可选）
    brief: string;           // 帖子简介
    coverUrl?: string;      // 封面图链接（可选）
    userId: number;          // 发布者ID
    id: number;              // 帖子ID
    clubId?: number;         // 所属圈子ID（可选）
    viewCount: number;       // 浏览量
    likeCount: number;       // 点赞数
    commentCount: number;    // 评论数
    isEssence: number;       // 是否精华（0：非精华，1：精华）
    createdAt: string;       // 发布时间
    interactContent?: number;// 互动内容（参考interaction接口）
    tag1?: string | null;    // 标签1（可为空）
    tag2?: string | null;    // 标签2（可为空）
    tag3?: string | null;    // 标签3（可为空）
};

/**
 * 帖子卡片组件
 * @param {PostCardProps} props - 组件属性
 */
const PostCard = (props: PostCardProps) => {
    // 解构组件属性
    const { title, brief, coverUrl,
        userId, id, clubId, createdAt, isEssence,
        viewCount, likeCount, commentCount, interactContent,
        tag1, tag2, tag3
    } = props;

    // 国际化钩子
    const { t } = useTranslation();

    // 路由导航钩子
    const navigate = useNavigate();
    // 当前路由信息钩子
    const location = useLocation();

    // 从Redux获取用户信息
    const user = useSelector((state: RootState) => state.user);

    // 当前帖子是否精华的状态
    const [curEssence, setCurEssence] = useState(isEssence);

    // 当前点赞数的状态
    const [curLikeCount, setCurLikeCount] = useState(likeCount);
    
    // 点赞状态
    const [isLiked, setIsLiked] = useState(interactContent === INTERACT_POST.LIKE);

    /**
     * 设置或取消帖子精华
     * @param {number} id - 帖子ID
     */
    const essencePost = async (id: number) => {
            // 计算目标精华状态（取反当前状态）
            const targetEssence = curEssence != 0 ? 0 : 1;
            // 调用API设置精华状态
            await postsAdminSetPostAsEssence(id, targetEssence).then(res => {
                if (res.success) {
                    // 更新本地状态
                    setCurEssence(targetEssence);
                    Msg.success(t('postCard.setEssenceSuccess'));
                } else {
                    throw new Error(res.message);
                }
            }).catch(err=>{
                Msg.error(err.message);
            })
    }

    /**
     * 打开帖子详情页
     * @param {number} id - 帖子ID
     * @param {string} target - 目标视图类型
     */
    const openPost = (id: number, target: string) => {
        if (target === PostViewType.EDIT) {
            // 使用正常的push模式导航，保留历史记录
            navigate(`/post/${id}?edit=true`);
        } else {
            navigate(`/post/${id}`);
        }
    }
    
    /**
     * 处理点赞操作
     * @param {number} id - 帖子ID
     */
    const handleLike = async (id: number) => {
        // 检查用户是否登录
        if (!user.isLoggedIn) {
            Msg.error(t('postCard.loginRequired'));
            return;
        }

        // 确定互动内容：如果已点赞则取消点赞，否则点赞
        const targetInteractContent = isLiked ? INTERACT_POST.NONE : INTERACT_POST.LIKE;

        try {
            const res = await interactionMakeInteractionWithPost(id, targetInteractContent);
            if (res.success) {
                // 更新点赞状态
                setIsLiked(!isLiked);
                // 更新点赞数
                setCurLikeCount(prev => isLiked ? prev - 1 : prev + 1);
                Msg.success(isLiked ? t('postCard.likeRemovedSuccess') : t('postCard.likeSuccess'));
            } else {
                throw new Error(res.message);
            }
        } catch (err: any) {
            Msg.error(err.message);
        }
    }



    /**
     * 删除帖子
     * @param {number} id - 帖子ID
     */
    const deletePost = async (id: number) => {
        try {
            const result = await Msg.confirm(t('postCard.deleteConfirm'));
            if (result) {
                postsDeletePostAuth(id).then(res => {
                    if (res.success) {
                        Msg.success(t('postCard.deleteSuccess'));
                    } else {
                        throw new Error(res.message);
                    }
                })
            }
        } catch (error) {
            console.log(error);
            Msg.error(t('postCard.deleteFailed'));
        }
    }

    /**
     * 举报帖子
     * @param {number} id - 帖子ID
     */
    const reportPost = (id: number) => {
        // 跳转到帖子详情页并添加report参数，用于自动打开举报功能
        // 使用正常的push模式导航，保留历史记录
        navigate(`/post/${id}?report=true`);
    }

    /**
     * 打开用户空间或圈子
     * @param {number} targetId - 目标ID
     * @param {string} targetType - 目标类型
     */
    const openSpaceView = (targetId: number, targetType: string) => {
        // 获取当前路由路径
        const currentPath = location.pathname;
        // 解析当前路由的类型和ID
        const pathSegments = currentPath.split('/').filter(segment => segment !== '');
        
        // 判断是否已经在目标页面
        if (pathSegments.length >= 2 && pathSegments[0] === targetType && parseInt(pathSegments[1]) === targetId) {
            // 如果已经在目标页面，则不执行跳转
            return;
        }
        
        // 否则，执行正常的跳转
        navigate(`/${targetType}/${targetId}`);
    }

    return <div className="post-card">
        {/* 帖子内容区域，点击打开帖子详情 */}
        <div>
            {/* 作者信息 */}
            <div className="author-info">
                <img
                    src={getSingleSimpleUserInfo(userId).avatarLink}
                    alt="Not Found"
                    onClick={() => openSpaceView(userId, SpaceViewType.USER)}
                />
                <div className="author-info-text">
                    <h4>{getSingleSimpleUserInfo(userId).name}</h4>
                    <p>{dayjs(createdAt).format("HH:mm:ss MMM DD, YYYY")}</p>
                </div>
            </div>
            <div className="content" onClick={() => openPost(id, PostViewType.CONTENT)}>

                {/* 帖子标题 */}
                {title && <h2>{title}</h2>}

                {/* 帖子简介和精华标记 */}
                <p>{(curEssence != 0) && <span className="badge">{t('postCard.essenceBadge')}</span>} {brief}</p>

                {/* 帖子封面图 */}
                {coverUrl && <img src={coverUrl} alt="Cover Not Found" />}
            </div>

        </div>

        {/* 帖子统计信息，点击打开评论区 */}
        <div className="interaction" onClick={() => openPost(id, PostViewType.COMMENT)}>
            <span> <EyeIcon /> {viewCount} </span>     {/* 浏览量 */}
            <span className="like-btn" onClick={(e) => {
                e.stopPropagation();
                handleLike(id);
            }}> <HandThumbUpIcon className={isLiked ? "liked" : ""} style={{color: isLiked ? "var(--primary)" : ""}}/> {curLikeCount} </span> {/* 点赞数 */}
            <span> <ChatBubbleBottomCenterIcon /> {commentCount}</span> {/* 评论数 */}
            {/* <span>{clubId}</span> */}
        </div>

        {/* 圈子信息和标签 */}
        <div className="belong">
            {clubId && <span onClick={() => openSpaceView(clubId, SpaceViewType.CLUB)}>{clubId}</span>}
            {tag1 && <span className="tag tag1">{tag1}</span>}
            {tag2 && <span className="tag tag2">{tag2}</span>}
            {tag3 && <span className="tag tag3">{tag3}</span>}
        </div>
        

        {/* 帖子操作菜单 */}
        <div className="menu">
            <EllipsisHorizontalIcon />
            <ul>
                {/* 分享功能 */}
                <li onClick={() => {
                    Msg.success(t('postCard.shareSuccess'));
                    copyToClipboard(`${window.location.origin}/?postId=${id}`)
                }}>{t('postCard.share')}</li>

                {/* 编辑和删除功能（仅作者或管理员/版主可见） */}
                {(user.id === userId || user.role != UserType.USER) && (
                    <>
                        <li onClick={() => openPost(id, PostViewType.EDIT)}>{t('postCard.edit')}</li>
                        <li onClick={() => deletePost(id)}>{t('postCard.delete')}</li>
                    </>
                )}

                {/* 设置精华功能（仅管理员/版主可见） */}
                {(user.role != UserType.USER && <li onClick={() => essencePost(id)}>{curEssence != 0 ? t('postCard.unsetEssence') : t('postCard.setEssence')}</li>)}

                {/* 举报功能 */}
                <li onClick={() => reportPost(id)}>{t('postCard.report')}</li>
            </ul>
        </div>
    </div>
}

export default PostCard;