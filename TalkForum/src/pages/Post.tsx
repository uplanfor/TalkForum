import Nav from "../components/Nav";
import PostDocument from "../components/PostDocument";
import BackgroundImg from "../components/BackgroundImg";
import NotFound from "./NotFound";
import { DefaultBackgroundUrl } from "../constants/default";
import { useEffect, useState } from "react";
import { postsGetPostDetailInformation } from "../api/ApiPosts";
import { useParams } from "react-router-dom";
import { parseMarkdown } from "../utils/MarkdownUtil";

const Post = () => {
  const { postId } = useParams();
  const [ok, setOk] = useState(()=> postId != undefined && /^[1-9]\d*$/.test(postId));
  const [content, setContent] = useState<string>("loading content...");
  
  useEffect(()=> {
    (async () => {
      if (ok && postId) {
        // const postIdNum = Number(postId);
        await postsGetPostDetailInformation(postId).then(async res => {
          // console.log(res);
          const {html, tocNodeTree} = await parseMarkdown(res.data.content);
          setContent(html);
        }).catch(err => {
          console.log(err);
          setOk(false);
        });
      }
    })()
  }, [ok]);

  return (
    ok ?
      <>
        <Nav hasFooter={false} />
        <BackgroundImg src={DefaultBackgroundUrl} />
        <PostDocument content={content} />
      </>
      : <NotFound />
  );
};

export default Post;