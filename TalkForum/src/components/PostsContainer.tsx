// import "../assets/normalize.css";
import "./styles/style_postscontainer.css";
import Request from "../utils/Request";
import { useState, useEffect } from "react";
import PostCard, { type PostCardProps } from "./PostCard";

interface PostContainerProps {
  tabs?: Map<string, string>;
}

const PostContainer = (props: PostContainerProps) => {
  const [posts, setPosts] = useState<Map<number, PostCardProps>>(new Map());
  const [loading, setLoading] = useState<boolean>(false);

  const fetchPosts = async () => {
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
    }, 3000);
  };

  // 组件挂载时请求数据
  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="container">
      {loading && <div className="center-text">Loading...</div>}

      <div className="list">
        {posts.size === 0 && !loading ? (
          <div className="center-text">No more posts!</div>
        ) : (
          Array.from(posts.entries()).map(([postId, postData]) => {
            return <PostCard key={postId} {...postData} />;
          })
        )}
      </div>
    </div>
  );
};

export default PostContainer;