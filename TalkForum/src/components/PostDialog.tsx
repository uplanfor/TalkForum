// import "../assets/normalize.css"
import "./styles/style_postdialog.css"
import Request from "../utils/Request";
import PopUpDialogBase from "./PopUpDialogBase"
import { type PopUpDialogButton } from "./PopUpDialogBase"
import { useRef, useState } from "react";
import  Msg  from "../utils/Msg";
import { postsCommitPostAuth } from "../api/ApiPosts";


interface PostDialogProps {
  onClose: () => void;
}

const PostDialog = ({ onClose }: PostDialogProps) => {
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [clubId, setClubId] = useState<number>(0);
  // 底部按钮配置
  const bottomBtns : PopUpDialogButton[] = [
    {
      text: "Cancel",
      onClick: () => {
        onClose();
      },
      type: "cancel"
    },
    {
      text: "Post",
      onClick: async () => {
        if(!contentRef.current) {return;}
        await postsCommitPostAuth(contentRef.current.value, titleRef.current?.value, clubId == 0 ? null : clubId).then((res) => {
          if (res.success) {
            Msg.success(res.message);
          onClose();
          } else {
            Msg.error(res.message);
          }
          console.log(res);
        });
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

  return (
    <PopUpDialogBase
      title="Create New Post"
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