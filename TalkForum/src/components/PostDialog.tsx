// import "../assets/normalize.css"
import "./styles/style_postdialog.css"
import PopUpDialogBase from "./PopUpDialogBase"
import { type PopUpDialogButton } from "./PopUpDialogBase"

interface PostDialogProps {
  onClose: () => void;
}

const PostDialog = ({ onClose }: PostDialogProps) => {
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
      onClick: () => {
        onClose();
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
        />
        <textarea
          className="post-dialog-textarea"
          placeholder="What's on your mind?"
        ></textarea>
      </div>
    </PopUpDialogBase>
  );
};

export default PostDialog;