// import "../assets/normalize.css";
import "./styles/style_popupdialogbase.css";
import { XMarkIcon } from "@heroicons/react/20/solid";
import React, { useEffect, useRef } from "react";

// 底部按钮配置类型
export interface PopUpDialogButton {
  text: string;                            // 按钮文本
  onClick: () => void;                     // 点击事件
  type?: "cancel" | "submit" | "default";  // 按钮类型（用于样式区分）
  className?: string;                      // 额外类名
}

// 组件属性类型（移除 visible 属性）
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
  const containerRef = useRef<HTMLDivElement>(null);
  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleClose = () => {
    const container = containerRef.current;
    if (container) {
      container.classList.add('slide-out');
      container.addEventListener('animationend', () => {
        onClose();
      }, { once: true });
    }
  };

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
        {/* 头部区域 */}
        <div className="popup-dialog-base-header">
          {showCloseIcon && (
          <XMarkIcon
            className="popup-dialog-base-close"
            onClick={handleClose}
            aria-label="Close dialog"
          />
          )}
          {title && <h2 className="popup-dialog-base-title">{title}</h2>}
        </div>


        {/* 主体内容区域 */}
        <div className="popup-dialog-base-body">{children}</div>

        
        {/* 工具条区域（有内容时显示） */}
        {toolBox && (
          <div className="popup-dialog-base-toolbox">{toolBox}</div>
        )}

        {/* 底部区域 */}
        {(footerLeft || bottomBtns.length > 0) && (
          <div className="popup-dialog-base-footer">
            {footerLeft && (
              <div className="popup-dialog-base-footer-left">
                {footerLeft}
              </div>
            )}
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