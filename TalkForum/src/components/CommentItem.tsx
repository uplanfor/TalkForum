import { DefaultAvatarUrl } from "../constants/default";
import "./styles/style_commentitem.css"

const CommentItem = () => {
    return (
        <div className="comment-item">
            <div className="comment-user-avatar">
                <img src={DefaultAvatarUrl} alt="user-avatar" />
            </div>
            <div className="comment-info">
                <h4 className="comment-user-name">User Name</h4>
                <p className="comment-content">This is a sample comment.</p>
                <p className="comment-date">Nov 24, 2025 <span>Reply</span></p>
            </div>
        </div>
    )
}

export default CommentItem;