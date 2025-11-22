// import "../assets/normalize.css"
import "./styles/style_postcard.css"
import { EyeIcon } from "@heroicons/react/20/solid";
import { HandThumbUpIcon } from "@heroicons/react/24/solid";
import { ChatBubbleBottomCenterIcon } from "@heroicons/react/24/solid";
import dayjs from "dayjs";

export interface PostCardProps {
    avatarLink: string;
    title?: string;
    brief: string;
    coverLink?: string;
    userId: number;
    authorName: string;
    id: number;
    clubId?: number;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    isEssence: boolean;
    createdAt: string;
};


const PostCard = (props: PostCardProps) => {
    const { avatarLink, title, brief, coverLink,
        userId, authorName, id, clubId, createdAt, isEssence,
        viewCount, likeCount, commentCount } = props;

    const gotoContentPartOfPost = () => {
        window.open(`/post/${id}?target=content`, "_blank");
    }

    const gotoCommentPartOfPost = () => {
        window.open(`/post/${id}?target=comment`, "_blank");
    }

    return <div className="card">
        <div onClick={gotoContentPartOfPost}>
            <div className="author-info">
                <img src={avatarLink} alt="Not Found" />
                <div className="author-info-text">
                    <h4>{authorName}</h4>
                    <p>{dayjs(createdAt).format("HH:mm:ss MMM DD, YYYY")}</p>
                </div>
            </div>

            {title && <h2>{title}</h2>}
            <p>{isEssence} {brief}</p>
            {coverLink && <img src={coverLink} alt="Cover Not Found" />}
        </div>


        <div className="detail">
            <span> <EyeIcon /> {viewCount} </span>
            <span> <HandThumbUpIcon onClick={gotoContentPartOfPost} /> {likeCount} </span>
            <span> <ChatBubbleBottomCenterIcon onClick={gotoCommentPartOfPost} /> {commentCount}</span>
            {/* <span>{clubId}</span> */}
        </div>

    </div>
}

export default PostCard;