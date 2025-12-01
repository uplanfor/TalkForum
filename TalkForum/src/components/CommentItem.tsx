import "./styles/style_commentitem.css"
import { type Comment } from "../api/ApiComment";
import { getSingleSimpleUserInfo } from "../utils/simpleUserInfoCache";
import dayjs from "dayjs";
import { type CommentTargetCallback } from "../pages/PostView";
import { HandThumbUpIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { commentGetCommentReplyList } from "../api/ApiComment";
import { throttle } from "../utils/debounce&throttle";

export interface CommentItemProps extends Comment {
    setCommentTarget: CommentTargetCallback;
}

const CommentItem = ({ content, createdAt, userId, setCommentTarget, id, likeCount, commentCount, postId }: CommentItemProps) => {
    const [replyList, setReplyList] = useState<Comment[]>([]);
    const [notFoldReplyList, setNotFoldReplyList] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [cursor, setCursor] = useState<number | null>(null);

    const loadMoreReplies = async () => {
        try {
            const res = await commentGetCommentReplyList(postId, cursor, id, null, 10);
            if (res.success) {
                setReplyList(prev => [...prev,...res.data.data]);
                setHasMore(res.data.hasMore);
                setCursor(res.data.cursor);
            } else {
                throw new Error(res.message);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const changeFoldReplyList = () => {
        setNotFoldReplyList(prev => !prev);
    }



    const throttleLoadMoreReplies = throttle(loadMoreReplies, 1000);



    return (
        <div className="comment-item">
            <div className="comment-user-avatar">
                <img src={getSingleSimpleUserInfo(userId).avatarLink} alt="user-avatar" />
            </div>
            <div className="comment-info">
                <h4 className="comment-user-name">{getSingleSimpleUserInfo(userId).name}</h4>
                <p className="comment-content">{content}</p>
                <p className="comment-footer">
                    <span className="comment-footer-time">{dayjs(createdAt).format("HH:mm, MMM DD, YYYY")} </span>
                    <span className="comment-footer-reply"
                        onClick={() => { setCommentTarget({ parentId: id, rootId: id, userId, commentToContent: content }) }}> Reply</span>
                    <span className="comment-footer-like">  {likeCount} <HandThumbUpIcon /> </span>
                </p>
                {commentCount > 0 &&
                    (<div className="comment-reply-list">
                        {notFoldReplyList && (
                            replyList.map((comment) => (
                                <div className="comment-item comment-reply-item" key={comment.id}>
                                    <div className="comment-user-avatar">
                                        <img src={getSingleSimpleUserInfo(comment.userId).avatarLink} alt="user-avatar" />
                                    </div>
                                    <div className="comment-info">
                                        <h4 className="comment-user-name">{getSingleSimpleUserInfo(comment.userId).name}</h4>
                                        <p className="comment-content">{comment.content}</p>
                                        <p className="comment-footer">
                                            <span className="comment-footer-time">{dayjs(comment.createdAt).format("HH:mm, MMM DD, YYYY")} </span>
                                            <span className="comment-footer-reply"
                                                onClick={() => { setCommentTarget({ parentId: comment.id, rootId: id, userId, commentToContent: comment.content }) }}> Reply</span>
                                            <span className="comment-footer-like">  {likeCount} <HandThumbUpIcon /> </span>
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                        <p className="reply-total">{commentCount} Replies
                            {<span onClick={changeFoldReplyList}>{notFoldReplyList ? "Fold" : "Unfold"}</span>}
                            {hasMore && <span onClick={throttleLoadMoreReplies}>See More</span>} </p>
                    </div>)}
            </div>
        </div>
    )
}

export default CommentItem;