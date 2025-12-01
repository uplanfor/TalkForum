import PostDocument from "./PostDocument";
import ReportDialog from "./ReportDialog";
import PostDialog from "./PostDialog";
import { createPortal } from "react-dom";
import BackgroundImg from "./BackgroundImg";
import "./styles/style_postview.css"
import { DefaultBackgroundUrl } from "../constants/default";
import { useEffect, useState, useRef } from "react";
import { postsGetPostDetailInformation } from "../api/ApiPosts";
import { parseMarkdown } from "../utils/MarkdownUtil";
import { type PostType } from "../api/ApiPosts";
import { ArrowLeftIcon, EllipsisHorizontalIcon } from "@heroicons/react/20/solid";
import { useSelector } from "react-redux";
import { commentPostComment } from "../api/ApiComment";
import Msg from "../utils/msg";
import { getSingleSimpleUserInfo } from "../utils/simpleUserInfoCache";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { copyToClipboard } from "../utils/clipboard";


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
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
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

        <EllipsisHorizontalIcon onClick={async () => {
          const menus = [
            "Share Post",
            "Report post",
            "Edit post",
            "Delete post",
          ]
          
          await Msg.menu(menus, "What do you want to do with this post?").then(res => {
            switch (res) {
            case 0:
              Msg.success("Already copy the link to clipboard! send to your friends to share!");
              copyToClipboard(`${window.location.origin}/?postId=${postId}`);
              break;
            case 1:
              setShowReportDialog(true);
              break;
            case 2:
              setShowPostDialog(true);
              break;
            case 3:
              Msg.confirm("Are you sure to delete this post?").then(res => {
                if (res) {
                  console.log("delete post");
                }
              });
              break;
            }
          })
        }} >
        </EllipsisHorizontalIcon>
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

      {showPostDialog && createPortal(
        <PostDialog notification="Edit post" title={post.title} content={post.content} onClose={() => setShowPostDialog(false)} />,
        document.body
      )}
      {showReportDialog && createPortal(
        <ReportDialog onClose={() => setShowReportDialog(false)} reportId={postId} />,
        document.body)}
    </div>
  );
};

export default PostView;