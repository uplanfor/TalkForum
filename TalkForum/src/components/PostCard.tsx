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
import { postsAdminSetPostAsEssence } from "../api/ApiPosts";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export interface PostCardProps {
    title?: string;
    brief: string;
    coverLink?: string;
    userId: number;
    id: number;
    clubId?: number;
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
    } = props;
    const navigate = useNavigate();
    // const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.user);
    const [curEssence, setCurEssence] = useState(isEssence);
    const [curLikeCount, setCurLikeCount] = useState(likeCount);

    const essencePost = async (id: number) => {
        try {
            const targetEssence = curEssence != 0 ? 0 : 1;
            await postsAdminSetPostAsEssence(id, targetEssence).then(res => {
                if (res.success) {
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

    const openPost = (id: number, target: string) => {
        navigate(`/post/${id}`);
    }

    const deletePost = (id: number) => {
        Msg.confirm("Are you sure to delete this post?").then(res => {
            if (res) {
            }
        })
    }

    const reportPost = (id: number) => {
        Msg.confirm("Are you sure to report this post?").then(res => {
            if (res) {
            }
        })
    }




    return <div className="post-card">
        <div onClick={()=>openPost(id, PostViewType.CONTENT)}>
            <div className="author-info">
                <img src={getSingleSimpleUserInfo(userId).avatarLink} alt="Not Found" onClick={()=>openSpaceView(userId, SpaceViewType.USER)} />
                <div className="author-info-text">
                    <h4>{getSingleSimpleUserInfo(userId).name}</h4>
                    <p>{dayjs(createdAt).format("HH:mm:ss MMM DD, YYYY")}</p>
                </div>
            </div>

            {title && <h2>{title}</h2>}
            <p>{(curEssence != 0) && <span className="badge">Essence</span>} {brief}</p>
            {coverLink && <img src={coverLink} alt="Cover Not Found" />}
        </div>


        <div className="detail" onClick={()=>openPost(id, PostViewType.COMMENT)}>
            <span> <EyeIcon /> {viewCount} </span>
            <span> <HandThumbUpIcon/> {curLikeCount} </span>
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
                        <li onClick={()=>openPost(id, PostViewType.EDIT)}>Edit</li>
                        <li onClick={()=>deletePost(id)}>Delete</li>
                    </>)}
                    {(user.role != UserType.USER && <li onClick={()=>essencePost(id)}>{curEssence != 0 ? "Unset Essence" : "Set Essence"}</li>)}
                    <li onClick={()=>reportPost(id)}>Report</li>
            </ul>
        </div>
    </div>
}

export default PostCard;