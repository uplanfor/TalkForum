import PostDocument from "./PostDocument";
import BackgroundImg from "./BackgroundImg";
import "./styles/style_postview.css"
import { DefaultBackgroundUrl } from "../constants/default";
import { useEffect, useState, useRef } from "react";
import { postsGetPostDetailInformation } from "../api/ApiPosts";
import { parseMarkdown } from "../utils/MarkdownUtil";
import { type PostType } from "../api/ApiPosts";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { useSelector } from "react-redux";
import { commentPostComment } from "../api/ApiComment";
import Msg from "../utils/Msg";
import { getSingleSimpleUserInfo } from "../utils/simpleUserInfoCache";
import { XMarkIcon } from "@heroicons/react/20/solid";


export interface PostViewProps {
  postId: number;
  onClose: () => void;
}

export interface CommentTarget {
  parentId: number | null;
  rootId: number | null;
  userId: number | null;
  commentToContent: string;
}

export type CommentTargetCallback = (target: CommentTarget) => void;


const PostView = ({ postId, onClose }: PostViewProps) => {
  const [ok, setOk] = useState(true);
  const [renderContent, setRenderContent] = useState<string>("");
  const { isLoggedIn } = useSelector((state: any) => state.user);
  const [commentTarget, setCommentTarget] = useState<CommentTarget>({ parentId: null, rootId: null, userId: null, commentToContent: "" });
  const [post, setPost] = useState<PostType>({
    id: postId,
    title: "",
    content: "",
    userId: 0,
    clubId: null,
    status: 0,
    isEssence: 0,
    createdAt: "",
    updatedAt: "",
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
  });

  const commentContentRef = useRef<HTMLTextAreaElement>(null);

  const handleCommentSend = async () => {
    if (commentContentRef.current) {
      let content = commentContentRef.current.value.trim();
      if (content === "") {
        Msg.error("Comment content cannot be empty!");
        return;
      }

      await commentPostComment(postId, content, commentTarget.rootId, commentTarget.parentId).then(res => {
        if (res.success) {
          Msg.success(res.message);
          commentContentRef.current!.value = "";
          setCommentTarget({ parentId: null, rootId: null, userId: null, commentToContent: "" });
        } else {
          throw new Error(res.message);
        }
      }).catch(err => {
        Msg.error(err.message);
        console.log(err);
      })
    }
  };

  useEffect(() => {
    (async () => {
      if (ok && postId) {
        // const postIdNum = Number(postId);
        await postsGetPostDetailInformation(postId).then(async res => {
          // console.log(res);
          if (res.success) {
            const post_result: PostType = res.data;
            setPost({ ...post_result });
            const { html, tocNodeTree } = await parseMarkdown(post_result.content);
            setRenderContent(html);
          } else {
            setOk(false);
          }
        }).catch(err => {
          console.log(err);
          setOk(false);
        });
      }
    })()
  }, [ok, postId]);

  return (
    <div className="post-view-cover">
      <div className="title">
        Post Detail
        <ArrowLeftIcon onClick={onClose} />
      </div>
      <BackgroundImg src={DefaultBackgroundUrl} style={{ height: 250 }} />
      <PostDocument {...post} renderContent={renderContent} setCommentTarget={setCommentTarget} />
      <div className="comment-input">
        {
          commentTarget.parentId && commentTarget.userId && (

            <div className="comment-reply-show">
              <p>
                <span>
                  Reply to {getSingleSimpleUserInfo(commentTarget.userId).name}: </span>
                {commentTarget.commentToContent}
              </p>
              <XMarkIcon onClick={() => {
                setCommentTarget({ parentId: null, rootId: null, userId: null, commentToContent: "" });
              }} />
            </div>
          )
        }
        <textarea placeholder={isLoggedIn ? "Leave a comment" : "Please login to leave a comment"} ref={commentContentRef}></textarea>
        <button onClick={handleCommentSend}>Send</button>
      </div>
    </div>
  );
};

export default PostView;