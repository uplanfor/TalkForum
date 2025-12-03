/**
 * 基础对话框组件
 * 提供通用的对话框功能，支持标题、主体内容、工具条和底部按钮
 * 包含滑入/滑出动画效果，可被其他组件（如PostDialog）继承使用
 */
// import "../assets/normalize.css";
import "./styles/style_popupdialogbase.css";
import { XMarkIcon } from "@heroicons/react/20/solid";
import React, { useEffect, useRef } from "react";

/**
 * 对话框底部按钮配置接口
 */
export interface PopUpDialogButton {
  text: string;                            // 按钮文本
  onClick: () => void;                     // 点击事件
  type?: "cancel" | "submit" | "default";  // 按钮类型（用于样式区分）
  className?: string;                      // 额外类名
}

/**
 * 基础对话框组件属性接口
 */
interface PopUpDialogBaseProps {
  title?: string;                     // 标题（可选）
  onClose: () => void;                // 关闭回调
  children?: React.ReactNode;         // 主体内容
  footerLeft?: React.ReactNode;       // 底部左侧内容（如"#Club"选择器）
  bottomBtns?: PopUpDialogButton[];   // 底部右侧按钮组
  toolBox?: React.ReactNode;          // 工具条内容（如markdown编辑器工具）
  style?: React.CSSProperties;        // 自定义样式
  showCloseIcon?: boolean;            // 是否显示关闭图标（默认显示）
}

/**
 * 基础对话框组件
 * @param {PopUpDialogBaseProps} props - 组件属性
 * @returns {JSX.Element} 对话框组件
 */
const PopUpDialogBase: React.FC<PopUpDialogBaseProps> = ({
  title = "",
  onClose,
  children,
  footerLeft,
  bottomBtns = [],
  toolBox,
  style,
  showCloseIcon = true,
}) => {
  // 对话框容器引用
  const containerRef = useRef<HTMLDivElement>(null);
  
  /**
   * 处理容器点击事件
   * 阻止事件冒泡，避免点击对话框内部关闭对话框
   * @param {React.MouseEvent} e - 鼠标事件对象
   */
  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  /**
   * 处理对话框关闭
   * 添加滑出动画，并在动画结束后调用关闭回调
   */
  const handleClose = () => {
    const container = containerRef.current;
    if (container) {
      container.classList.add('slide-out');
      container.addEventListener('animationend', () => {
        onClose();
      }, { once: true });
    }
  };

  /**
   * 组件挂载时添加滑入动画
   */
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.classList.add('slide-in');
    }
  }, []);

  return (
    <div
      className="popup-dialog-base-cover"
      style={style}
    >
      <div
        ref={containerRef}
        className="popup-dialog-base-container"
        onClick={handleContainerClick}
      >
        {/* 头部区域：包含关闭按钮和标题 */}
        <div className="popup-dialog-base-header">
          {/* 关闭按钮 */}
          {showCloseIcon && (
          <XMarkIcon
            className="popup-dialog-base-close"
            onClick={handleClose}
            aria-label="Close dialog"
          />
          )}
          {/* 标题 */}
          {title && <h2 className="popup-dialog-base-title">{title}</h2>}
        </div>

        {/* 主体内容区域：显示子组件内容 */}
        <div className="popup-dialog-base-body">{children}</div>

        {/* 工具条区域（有内容时显示）：如markdown编辑器工具 */}
        {toolBox && (
          <div className="popup-dialog-base-toolbox">{toolBox}</div>
        )}

        {/* 底部区域：包含左侧内容和右侧按钮组 */}
        {(footerLeft || bottomBtns.length > 0) && (
          <div className="popup-dialog-base-footer">
            {/* 底部左侧内容：如"#Club"选择器 */}
            {footerLeft && (
              <div className="popup-dialog-base-footer-left">
                {footerLeft}
              </div>
            )}
            {/* 底部右侧按钮组 */}
            {bottomBtns.length > 0 && (
              <div className="popup-dialog-base-footer-right">
                {bottomBtns.map((btn, index) => (
                  <button
                    key={index}
                    className={`
                      ${btn.type === "cancel" ? "popup-dialog-base-cancel" : ""}
                      ${btn.type === "submit" ? "popup-dialog-base-submit" : ""}
                      ${btn.type === "default" ? "popup-dialog-base-default" : ""}
                      ${btn.className || ""}
                    `}
                    onClick={btn.onClick}
                  >
                    {btn.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PopUpDialogBase;