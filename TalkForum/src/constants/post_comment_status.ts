export const PostCommentStatusEnum = {
    PASS: "PASS",             // 通过
    REJECT: "REJECT",         // 拒绝
    PENDING: "PENDING",       // 待审核
    DELETE: "DELETE",         // 帖子或评论删掉
}

// 定义帖子状态类型，要求是PostCommentStatusEnum键对应的值
export type PostStatus = (typeof PostCommentStatusEnum)[keyof typeof PostCommentStatusEnum];
export type CommentStatus = (typeof PostCommentStatusEnum)[keyof typeof PostCommentStatusEnum];