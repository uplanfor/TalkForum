import "../assets/normalize.css"
import { useParams } from "react-router-dom";
import Nav from "../components/Nav";
import PostDocument from "../components/PostDocument";
import BackgroundImg from "../components/BackgroundImg";
import NotFound from "./NotFound";
import { DefaultBackgroundUrl } from "../constants/default";

const Post = () => {
  const { postId } = useParams();
  const ok = typeof postId === "number";

  return (
    ok ?
      <>
        <Nav />
        <BackgroundImg src={DefaultBackgroundUrl} />
        <PostDocument />
        <div>{postId}</div>
      </>
      : <NotFound />
  );
};

export default Post;