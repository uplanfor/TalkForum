import PostDocument from "./PostDocument";
import BackgroundImg from "./BackgroundImg";
import "./styles/style_postview.css"
import { DefaultBackgroundUrl } from "../constants/default";
import { useEffect, useState } from "react";
import { postsGetPostDetailInformation } from "../api/ApiPosts";
import { parseMarkdown } from "../utils/MarkdownUtil";
import { type PostType } from "../api/ApiPosts";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { useSelector } from "react-redux";

interface PostViewProps {
  postId: number;
  onClose: () => void;
}

const PostView = ({postId, onClose} : PostViewProps) => {
  const [ok, setOk] = useState(true);
  const [renderContent, setRenderContent] = useState<string>("");
  const {isLoggedIn} = useSelector((state: any) => state.user);
  const [post, setPost] = useState<PostType>({
    id: 0,
    title: "",
    content: "",
    userId: 0,
    clubId: null,
    status: 0,
    isEssence: false,
    createdAt: "",
    updatedAt: "",
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
  });

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
  }, [ok]);

  return (
      <div className="post-view-cover">
        <div className="title">
          Post Detail
          <ArrowLeftIcon onClick={onClose}/>
        </div>
        <BackgroundImg src={DefaultBackgroundUrl} style={{height: 250}}/>
        <PostDocument {...post} renderContent={renderContent}/>
        <div className="comment-input">
          <textarea placeholder={isLoggedIn? "Leave a comment" : "Please login to leave a comment"}></textarea>
          <button>Send</button>
        </div>
      </div>
  );
};

export default PostView;