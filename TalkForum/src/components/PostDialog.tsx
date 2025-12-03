/**
 * 帖子发布/编辑对话框组件
 * 用于创建新帖子或修改现有帖子
 * 基于PopUpDialogBase组件构建，支持标题和内容输入
 */
// import "../assets/normalize.css"
import "./styles/style_postdialog.css"
import PopUpDialogBase from "./PopUpDialogBase"
import { type PopUpDialogButton } from "./PopUpDialogBase"
import { useEffect, useRef, useState } from "react";
import Msg from "../utils/msg";
import { postsCommitPostAuth, postsModifyPostAuth } from "../api/ApiPosts";
import { throttle } from "../utils/debounce&throttle";

/**
 * 帖子对话框组件属性接口
 */
interface PostDialogProps {
  onClose: () => void;           // 关闭对话框的回调函数
  notification: string;         // 对话框标题通知
  title: string;                // 帖子标题（编辑时使用）
  clubInputId?: number;         // 俱乐部ID（可选）
  content: string;              // 帖子内容（编辑时使用）
  postId?: number | null;       // 帖子ID（编辑时使用，新建时为null）
}

/**
 * 帖子发布/编辑对话框组件
 * @param {PostDialogProps} props - 组件属性
 */
const PostDialog = ({ onClose, notification = "Create New Post", title = "", clubInputId = 0, content = "", postId = null }: PostDialogProps) => {
  // 标题输入框引用
  const titleRef = useRef<HTMLInputElement>(null);
  
  // 内容文本域引用
  const contentRef = useRef<HTMLTextAreaElement>(null);
  
  // 俱乐部ID状态
  const [clubId, setClubId] = useState<number>(clubInputId);

  /**
   * 节流处理的提交帖子方法
   * 防止频繁提交，支持发布新帖子和修改现有帖子
   */
  const throttleCommitPost = throttle(async () => {
    if (!contentRef.current) { return; }
    // 判断是否是修改帖子还是发布帖子
    if (postId == null) {
      // 发布新帖子
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
      // 修改现有帖子
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

  // 底部左侧内容（俱乐部选择按钮）
  const footerLeft = (
    <button className="post-dialog-select-club">
      #Club
    </button>
  );

  // 工具条内容（预留markdown编辑器工具条位置）
  const toolBox = (
    <div className="post-dialog-toolbox-content">
      {/* 预留markdown编辑器工具条 */}
    </div>
  );

  /**
   * 组件挂载时的初始化效果
   * 设置标题和内容输入框的值，并将焦点放在内容输入框上
   */
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
        {/* 帖子标题输入框 */}
        <input
          type="text"
          className="post-dialog-input"
          placeholder="Post title (optional)"
          ref={titleRef}
        />
        
        {/* 帖子内容输入框 */}
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