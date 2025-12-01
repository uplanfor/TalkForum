// import "../assets/normalize.css"
import "./styles/style_postdialog.css"
import PopUpDialogBase from "./PopUpDialogBase"
import { type PopUpDialogButton } from "./PopUpDialogBase"
import { useEffect, useRef, useState } from "react";
import Msg from "../utils/msg";
import { postsCommitPostAuth, postsModifyPostAuth } from "../api/ApiPosts";
import { throttle } from "../utils/debounce&throttle";


interface PostDialogProps {
  onClose: () => void;
  notification: string;
  title: string;
  clubInputId?: number;
  content: string;
  postId?: number | null;
}

const PostDialog = ({ onClose, notification = "Create New Post", title = "", clubInputId = 0, content = "", postId = null }: PostDialogProps) => {
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [clubId, setClubId] = useState<number>(clubInputId);

  const throttleCommitPost = throttle(async () => {
    if (!contentRef.current) { return; }
    // 判断是否是修改帖子还是发布帖子
    if (postId == null) {
      await postsCommitPostAuth(contentRef.current.value, titleRef.current?.value, clubId == 0 ? null : clubId).then((res) => {
        if (res.success) {
          Msg.success(res.message);
          onClose();
        } else {
          Msg.error(res.message);
        }
        console.log(res);
      });
    } else {
      await postsModifyPostAuth(postId, contentRef.current.value, titleRef.current?.value, clubId == 0 ? null : clubId).then((res) => {
        if (res.success) {
          Msg.success(res.message);
          onClose();
        } else {
          Msg.error(res.message);
        }
        console.log(res);
      });
    }

  }, 500);

  // 底部按钮配置
  const bottomBtns: PopUpDialogButton[] = [
    {
      text: "Cancel",
      onClick: () => {
        onClose();
      },
      type: "cancel"
    },
    {
      text: "Post",
      onClick: () => {
        throttleCommitPost();
      },
      type: "submit"
    }
  ];

  // 底部左侧内容
  const footerLeft = (
    <button className="post-dialog-select-club">
      #Club
    </button>
  );

  // 工具条内容
  const toolBox = (
    <div className="post-dialog-toolbox-content">
      {/* 预留markdown编辑器工具条 */}
    </div>
  );

  useEffect(() => {
    // 给标题输入框赋值
    if (titleRef.current) {
      titleRef.current.value = title;
    }
    // 给内容文本域赋值
    if (contentRef.current) {
      contentRef.current.value = content;
      contentRef.current.focus();
    }
  }, []);

  return (
    <PopUpDialogBase
      title={notification}
      onClose={onClose}
      footerLeft={footerLeft}
      bottomBtns={bottomBtns}
      toolBox={toolBox}
    >
      {/* 主体内容容器 - 使用flex布局让textarea占满剩余空间 */}
      <div className="post-dialog-content-container">
        <input
          type="text"
          className="post-dialog-input"
          placeholder="Post title (optional)"
          ref={titleRef}
        />
        <textarea
          className="post-dialog-textarea"
          placeholder="What's on your mind?"
          ref={contentRef}
        ></textarea>
      </div>
    </PopUpDialogBase>
  );
};

export default PostDialog;