/**
 * 帖子卡片组件
 * 用于展示帖子的基本信息，包括标题、简介、作者、发布时间、浏览量、点赞数、评论数等
 * 支持查看详情、编辑、删除、分享、举报等功能
 */
// import "../assets/normalize.css"
import { useSelector } from "react-redux";
import { type RootState } from "../store";
import "./styles/style_postcard.css"
import { EyeIcon } from "@heroicons/react/20/solid";
import { HandThumbUpIcon } from "@heroicons/react/24/solid";
import { ChatBubbleBottomCenterIcon } from "@heroicons/react/24/solid";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";
import dayjs from "dayjs";
import { SpaceViewType, UserType } from "../constants/default";
import { PostViewType } from "../constants/default";
import { getSingleSimpleUserInfo } from "../utils/simpleUserInfoCache";
import { copyToClipboard } from "../utils/clipboard";
import { postsAdminSetPostAsEssence } from "../api/ApiPosts";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Msg from "../utils/msg";

/**
 * 帖子卡片组件属性接口
 */
export interface PostCardProps {
    title?: string;          // 帖子标题（可选）
    brief: string;          // 帖子简介
    coverLink?: string;     // 封面图链接（可选）
    userId: number;         // 发布者ID
    id: number;             // 帖子ID
    clubId?: number;        // 所属圈子ID（可选）
    viewCount: number;      // 浏览量
    likeCount: number;      // 点赞数
    commentCount: number;   // 评论数
    isEssence: number;      // 是否精华（0：非精华，1：精华）
    createdAt: string;      // 发布时间
};

/**
 * 帖子卡片组件
 * @param {PostCardProps} props - 组件属性
 */
const PostCard = (props: PostCardProps) => {
    // 解构组件属性
    const { title, brief, coverLink,
        userId, id, clubId, createdAt, isEssence,
        viewCount, likeCount, commentCount,
    } = props;

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
    
    // 当前是否点赞的状态
    const [isLiked, setIsLiked] = useState(false);
    // 当前互动记录ID
    const [interactionId, setInteractionId] = useState<number | null>(null);

    /**
     * 设置或取消帖子精华
     * @param {number} id - 帖子ID
     */
    const essencePost = async (id: number) => {
        try {
            // 计算目标精华状态（取反当前状态）
            const targetEssence = curEssence != 0 ? 0 : 1;
            // 调用API设置精华状态
            await postsAdminSetPostAsEssence(id, targetEssence).then(res => {
                if (res.success) {
                    // 更新本地状态
                    setCurEssence(targetEssence);
                    Msg.success("Set essence successfully!");
                } else {
                    throw new Error(res.message);
                }
            })
        } catch (error) {
            console.log(error);
            Msg.error("Failed to set essence!");
        }
    }

    /**
     * 打开帖子详情页
     * @param {number} id - 帖子ID
     * @param {string} target - 目标视图类型
     */
    const openPost = (id: number, target: string) => {
        navigate(`/post/${id}`);
    }
    
    /**
     * 处理点赞操作
     * @param {number} id - 帖子ID
     */
    const handleLike = async (id: number) => {
        try {
            if (isLiked) {
            } else {
            }
        } catch (error) {
            console.error("互动操作失败:", error);
            Msg.error("操作失败，请稍后重试");
        }
    }

    /**
     * 删除帖子
     * @param {number} id - 帖子ID
     */
    const deletePost = (id: number) => {
        Msg.confirm("Are you sure to delete this post?").then(res => {
            if (res) {
                // TODO: 实现删除帖子功能
            }
        })
    }

    /**
     * 举报帖子
     * @param {number} id - 帖子ID
     */
    const reportPost = (id: number) => {
        Msg.confirm("Are you sure to report this post?").then(res => {
            if (res) {
                // TODO: 实现举报帖子功能
            }
        })
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
            <div onClick={() => openPost(id, PostViewType.CONTENT)}>

                {/* 帖子标题 */}
                {title && <h2>{title}</h2>}

                {/* 帖子简介和精华标记 */}
                <p>{(curEssence != 0) && <span className="badge">Essence</span>} {brief}</p>

                {/* 帖子封面图 */}
                {coverLink && <img src={coverLink} alt="Cover Not Found" />}
            </div>

        </div>

        {/* 帖子统计信息，点击打开评论区 */}
        <div className="detail" onClick={() => openPost(id, PostViewType.COMMENT)}>
            <span> <EyeIcon /> {viewCount} </span>     {/* 浏览量 */}
            <span className="like-btn" onClick={(e) => {
                e.stopPropagation();
                handleLike(id);
            }}> <HandThumbUpIcon className={isLiked ? "liked" : ""} /> {curLikeCount} </span> {/* 点赞数 */}
            <span> <ChatBubbleBottomCenterIcon /> {commentCount}</span> {/* 评论数 */}
            {/* <span>{clubId}</span> */}
        </div>

        {/* 帖子操作菜单 */}
        <div className="menu">
            <EllipsisHorizontalIcon />
            <ul>
                {/* 分享功能 */}
                <li onClick={() => {
                    Msg.success("Already copy the link to clipboard! send to your friends to share!");
                    copyToClipboard(`${window.location.origin}/?postId=${id}`)
                }}>Share</li>

                {/* 编辑和删除功能（仅作者或管理员/版主可见） */}
                {(user.id === userId || user.role != UserType.USER) && (
                    <>
                        <li onClick={() => openPost(id, PostViewType.EDIT)}>Edit</li>
                        <li onClick={() => deletePost(id)}>Delete</li>
                    </>
                )}

                {/* 设置精华功能（仅管理员/版主可见） */}
                {(user.role != UserType.USER && <li onClick={() => essencePost(id)}>{curEssence != 0 ? "Unset Essence" : "Set Essence"}</li>)}

                {/* 举报功能 */}
                <li onClick={() => reportPost(id)}>Report</li>
            </ul>
        </div>
    </div>
}

export default PostCard;