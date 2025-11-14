// import React from "react";
import "../assets/normalise.css"
import "./styles/style_postscontainer.css"
import PostCard, { type PostCardProps } from "./PostCard"


interface PostContainerProps {
}

const PostContainer = (props: PostContainerProps) => {
    // 变量c为 PostCardProps 类型

    const posts = {
        1: {
            avatarLink: "https://pic1.imgdb.cn/item/6905cbfa3203f7be00bf6e98.webp",
            brief: "我要吃螺蛳粉!",
            coverLink: "https://bing.img.run/1366x768.php",
            authorId: 1,
            authorName: "Author Name",
            postId: 1,
            clubId: 1,
            viewCount: 10,
            likeCount: 5,
            commentCount: 2,
            createAt: "2025-11-07 10:10:10"
        },
        2: {
            avatarLink: "https://pic1.imgdb.cn/item/6905cbfa3203f7be00bf6e98.webp",
            title: "React + Spring Boot 实战项目实践分享",
            brief: "本期主播将分享如何使用 React + Spring Boot 构建一个完整的实战项目，并分享实践过程中遇到的问题和解决方案。",
            coverLink: "https://bing.img.run/1366x768.php",
            authorId: 1,
            authorName: "Author Name",
            postId: 1,
            clubId: 1,
            viewCount: 10,
            likeCount: 5,
            commentCount: 2,
            createAt: "2025-11-05 10:10:10"
        },
        3: {
            avatarLink: "https://pic1.imgdb.cn/item/6905cbfa3203f7be00bf6e98.webp",
            title: "Post Title",
            brief: "C++ OpenGL 学习笔记",
            authorId: 1,
            authorName: "Author Name",
            postId: 1,
            clubId: 1,
            viewCount: 10,
            likeCount: 5,
            commentCount: 2,
            createAt: "2025-11-08 10:10:10"
        },
    }

    // 遍历 posts 数组，渲染 PostCard 组件
    return <div className="container">
        <div className="list">
            {Object.keys(posts).map((key) => {
                const c = posts[key] as PostCardProps
                return <PostCard key={key} {...c} />
            })}
        </div>
    </div>
}

export default PostContainer;