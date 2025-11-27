import "./styles/style_postdocument.css"
import { type PostType } from "../api/ApiPosts";
import CommentItem from "./CommentItem";
import dayjs from "dayjs";
import { getSingleSimpleUserInfo, updateSimpleUserInfoCache } from "../utils/simpleUserInfoCache";

interface PostDocumentProps extends PostType {
  renderContent: string;
}

const PostDocument = (props: PostDocumentProps) => {
  const { content, renderContent, title, userId, clubId, status, isEssence, createdAt, updatedAt, viewCount, likeCount, commentCount } = props;
  return (
    <div className="post-document">
      <div className="post-window">
        <div className="post-header">
          <h1 className="post-title"> {title}</h1>
          <div className="author-info">
            <img src={getSingleSimpleUserInfo(userId).avatarLink} alt="Avatar" />
            <div className="author-combo">
              <span className="author-name">{getSingleSimpleUserInfo(userId).name}</span>
              <span className="post-date">{(isEssence != 0) && <span className="badge">Essence</span>} Last Edited at {dayjs(updatedAt).format("HH:mm:ss MM DD, YYYY")}</span>
            </div>
          </div>
        </div>
        <div className="post-content" dangerouslySetInnerHTML={{ __html: renderContent }}></div>
        <div className="post-comment">
          <h2>Comments</h2>
          <div>
            <CommentItem></CommentItem>
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default PostDocument;