/**
 * 设置对话框组件
 * 用于用户配置应用的语言和主题设置
 */
// import "../assets/normalize.css"
import "./styles/style_settingdialog.css"
import PopUpDialogBase from "./PopUpDialogBase"
import { type PopUpDialogButton } from "./PopUpDialogBase"
import { useRef } from "react"
import { THEMES } from "../config/ThemeConfig"
import ThemeUtil from "../utils/ThemeUtil"
import { type ThemeKey } from "../config/ThemeConfig"
import Msg from "../utils/msg"

/**
 * 设置对话框属性接口
 */
interface SettingDialogProps {
  /**
   * 关闭对话框的回调函数
   */
  onClose: () => void;
}

/**
 * 设置对话框组件
 * 用于用户配置应用的语言和主题设置
 */
const SettingDialog = ({ onClose }: SettingDialogProps) => {
  /**
   * 对话框底部按钮配置
   */
  const bottomBtns: PopUpDialogButton[] = [
    {
      text: "Cancel",
      onClick: () => {
        onClose();
      },
      type: "cancel"
    },
    {
      text: "Apply",
      onClick: () => {
        // formRef.current?.dispatchEvent(new Event('submit'));
        formRef.current?.requestSubmit();
      },
      type: "submit"
    }
  ];

  /**
   * 表单引用，用于访问表单元素和触发提交
   */
  const formRef = useRef<HTMLFormElement>(null);
  
  /**
   * 表单提交处理函数
   * 收集表单数据并应用设置
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) { return; }

    // collect form data
    const formData = new FormData(formRef.current);
    const submitData = {
      language: formData.get("language") as string,
      theme: formData.get("theme") as string,
    };

    // 保存语言设置到localStorage
    localStorage.setItem("language", submitData.language);
    // 切换主题
    ThemeUtil.switchTheme(submitData.theme as ThemeKey);

    // 显示成功消息
    Msg.success("Settings applied successfully!");
  };

  /**
   * 获取默认语言设置，优先使用localStorage中的值，否则使用默认值
   */
  const defaultLanguage = localStorage.getItem("language") || "English(US)";
  
  /**
   * 获取默认主题设置，优先使用当前主题，否则使用默认主题
   */
  const defaultTheme = ThemeUtil.getTheme() || "default";

  return (
    <PopUpDialogBase
      title="Settings"
      onClose={onClose}
      bottomBtns={bottomBtns}
    >
      {/* 设置表单 */}
      <form ref={formRef} onSubmit={handleSubmit}>
        <ul className="setting-dialog-container">
          {/* 语言选择 */}
          <li>Language: 
          <select name="language" defaultValue={defaultLanguage}>
            <option value="English(US)">English(US)</option>
            <option value="English(UK)">English(UK)</option>
          </select>
          </li>
          
          {/* 主题选择 */}
          <li>Theme:
            <select name="theme" defaultValue={defaultTheme}>
              <option key="default" value="default">default</option>

              {/* 动态生成主题选项 */}
              {(Object.keys(THEMES) as ThemeKey[]).map(key => (
                <option key={key} value={key}>{THEMES[key].name}</option>
              ))}
            </select>
          </li>
        </ul>
      </form>
    </PopUpDialogBase>
  );
};

export default SettingDialog;