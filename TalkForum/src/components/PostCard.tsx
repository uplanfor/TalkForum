// import "../assets/normalize.css"
import { useDispatch, useSelector } from "react-redux";
import { type RootState, type AppDispatch } from "../store";
import "./styles/style_postcard.css"
import { EyeIcon } from "@heroicons/react/20/solid";
import { HandThumbUpIcon } from "@heroicons/react/24/solid";
import { ChatBubbleBottomCenterIcon } from "@heroicons/react/24/solid";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";
import dayjs from "dayjs";
import { SpaceViewType, UserType } from "../constants/default";
import { PostViewType } from "../constants/default";
import { getSingleSimpleUserInfo } from "../utils/simpleUserInfoCache";
import Msg from "../utils/msg";
import { copyToClipboard } from "../utils/clipboard";

export interface PostCardProps {
    title?: string;
    brief: string;
    coverLink?: string;
    userId: number;
    id: number;
    clubId?: number;
    openPostView: (postId: number, target: string) => void;
    openSpaceView: (id: number, target: string) => void;
    deletePost: (postId: number) => void;
    reportPost: (postId: number) => void;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    isEssence: number;
    createdAt: string;
};


const PostCard = (props: PostCardProps) => {
    const { title, brief, coverLink,
        userId, id, clubId, createdAt, isEssence,
        viewCount, likeCount, commentCount,
        openPostView, openSpaceView, deletePost, reportPost
    } = props;
    // const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.user);

    return <div className="post-card">
        <div onClick={()=>openPostView(id, PostViewType.CONTENT)}>
            <div className="author-info">
                <img src={getSingleSimpleUserInfo(userId).avatarLink} alt="Not Found" onClick={()=>openSpaceView(userId, SpaceViewType.USER)} />
                <div className="author-info-text">
                    <h4>{getSingleSimpleUserInfo(userId).name}</h4>
                    <p>{dayjs(createdAt).format("HH:mm:ss MMM DD, YYYY")}</p>
                </div>
            </div>

            {title && <h2>{title}</h2>}
            <p>{(isEssence != 0) && <span className="badge">Essence</span>} {brief}</p>
            {coverLink && <img src={coverLink} alt="Cover Not Found" />}
        </div>


        <div className="detail" onClick={()=>openPostView(id, PostViewType.COMMENT)}>
            <span> <EyeIcon /> {viewCount} </span>
            <span> <HandThumbUpIcon/> {likeCount} </span>
            <span> <ChatBubbleBottomCenterIcon/> {commentCount}</span>
            {/* <span>{clubId}</span> */}
        </div>

        <div className="menu">
            <EllipsisHorizontalIcon />
            <ul>
                <li onClick={()=>{
                    Msg.success("Already copy the link to clipboard! send to your friends to share!");
                    copyToClipboard(`${window.location.origin}/?postId=${id}`)
                }}>Share</li>
                {(user.id === userId || user.role != UserType.USER) && (
                    <>
                        <li onClick={()=>openPostView(id, PostViewType.EDIT)}>Edit</li>
                        <li onClick={()=>deletePost(id)}>Delete</li>
                    </>)}
                    <li onClick={()=>reportPost(id)}>Report</li>
            </ul>
        </div>
    </div>
}

export default PostCard;