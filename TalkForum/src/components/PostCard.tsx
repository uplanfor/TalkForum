import "../assets/normalize.css"
import "./styles/style_postcard.css"
import { EyeIcon } from "@heroicons/react/20/solid";
import { HandThumbUpIcon } from "@heroicons/react/24/solid";
import { ChatBubbleBottomCenterIcon } from "@heroicons/react/24/solid";

export interface PostCardProps {
    avatarLink: string;
    title?: string;
    brief: string;
    coverLink?: string;
    authorId: number;
    authorName: string;
    postId: number;
    clubId?: number;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    createAt: string;
};


const PostCard = (props: PostCardProps) => {
    const { avatarLink, title, brief, coverLink,
        authorId, authorName, postId, clubId, createAt,
        viewCount, likeCount, commentCount } = props;
    
    return <div className="card">
        <div className="author-info">
            <img src={avatarLink} alt="Not Found" />
            <div className="author-info-text">
                <h4>{authorName}</h4>
                <p>{createAt}</p>
            </div>
        </div>

        {title && <h2>{title}</h2>}
        <p>{brief}</p>
        {coverLink && <img src={coverLink} alt="Cover Not Found" />}

        <div className="detail">
            <span> <EyeIcon /> {viewCount} </span>
            <span> <HandThumbUpIcon /> {likeCount} </span>
            <span> <ChatBubbleBottomCenterIcon /> {commentCount}</span>
        </div>

    </div>
}

export default PostCard;