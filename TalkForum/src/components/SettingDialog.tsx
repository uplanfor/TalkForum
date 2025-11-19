// import "../assets/normalize.css"
import "./styles/style_settingdialog.css"
import PopUpDialogBase from "./PopUpDialogBase"
import { type PopUpDialogButton } from "./PopUpDialogBase"
import { useRef } from "react"
import { THEMES } from "../config/ThemeConfig"
import ThemeUtil from "../utils/ThemeUtil"
import { type ThemeKey } from "../config/ThemeConfig"
import Msg from "../utils/msg"

interface SettingDialogProps {
  onClose: () => void;
}

const SettingDialog = ({ onClose }: SettingDialogProps) => {
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

  const formRef = useRef<HTMLFormElement>(null);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) { return; }

    // collect form data
    const formData = new FormData(formRef.current);
    const submitData = {
      language: formData.get("language") as string,
      theme: formData.get("theme") as string,
    };

    localStorage.setItem("language", submitData.language);
    ThemeUtil.switchTheme(submitData.theme as ThemeKey);

    Msg.success("Settings applied successfully!");
  }

  const defaultLanguage =localStorage.getItem("language") || "English(US)";
  const defaultTheme = ThemeUtil.getTheme() || "default";

  return (
    <PopUpDialogBase
      title="Settings"
      onClose={onClose}
      bottomBtns={bottomBtns}
    >
      <form ref={formRef} onSubmit={handleSubmit}>
        <ul className="setting-dialog-container">
          <li>Language: 
          <select name="language" defaultValue={defaultLanguage}>
            <option value="English(US)">English(US)</option>
            <option value="English(UK)">English(UK)</option>
          </select>
          </li>
          <li>Theme:
            <select name="theme" defaultValue={defaultTheme}>
              <option key="default" value="default">default</option>

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