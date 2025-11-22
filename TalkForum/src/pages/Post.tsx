import "../assets/normalize.css"
import { useParams } from "react-router-dom";
import Nav from "../components/Nav";
import PostDocument from "../components/PostDocument";
import BackgroundImg from "../components/BackgroundImg";
import NotFound from "./NotFound";
import { DefaultBackgroundUrl } from "../constants/default";
import Request from "../utils/Request";
import { useEffect, useState } from "react";
import { postsGetPostDetailInformation } from "../api/ApiPosts";

const Post = () => {
  const { postId } = useParams();
  const [ok, setOk] = useState(()=> postId != undefined && /^[1-9]\d*$/.test(postId));
  
  useEffect(()=> {
    (async () => {
      if (ok && postId) {
        // const postIdNum = Number(postId);
        await postsGetPostDetailInformation(postId).then(res => {
          console.log(res);
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
        <PostDocument />
      </>
      : <NotFound />
  );
};

export default Post;