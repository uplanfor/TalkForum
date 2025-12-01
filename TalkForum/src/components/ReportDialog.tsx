// import "../assets/normalize.css"
import "./styles/style_reportdialog.css"
import PopUpDialogBase from "./PopUpDialogBase"
import { type PopUpDialogButton } from "./PopUpDialogBase"
import { useEffect, useRef, useState } from "react";
import Msg from "../utils/Msg";
import { postsCommitPostAuth } from "../api/ApiPosts";
import { throttle } from "../utils/debounce&throttle";
import { ReportTypeEnum } from "../constants/report_constant";


interface ReportDialogProps {
  onClose: () => void;
  notification?: string;
  content?: string;
  reportId: number;
}

const ReportDialog = ({ onClose, notification = "Report", content = "" }: ReportDialogProps) => {
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const throttleReport = throttle(async () => {
    if (!contentRef.current) { return; }
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
      text: "Submit",
      onClick: () => {
        throttleReport();
      },
      type: "submit"
    }
  ];

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.value = content;
    }
  }, []);

  return (
    <PopUpDialogBase
      title={notification}
      onClose={onClose}
      bottomBtns={bottomBtns}
    >
      <form>

        <div className="report-reasons-header">
          <h3>Report Reasons</h3>
          <p>Choose report type.</p>
        </div>
        <div className="report-reasons-grid">
          {ReportTypeEnum.map((item, index) => {
        const radioId = `IllegalContent_0${index + 1}`;

        return (
          <label 
            htmlFor={radioId} 
            key={radioId} // React 列表必须加唯一 key
            style={{ marginRight: '16px', cursor: 'pointer' }} // 基础样式分隔
          >
            <input
              type="radio"
              name="IllegalContent" // 同名保证互斥
              id={radioId}
              value={item.value}
            />
            <span style={{ marginLeft: '4px' }}>{item.label}</span>
          </label>
        );
      })}
        </div>
      </form>
      <div className="report-dialog-content-container">
        <textarea
          className="report-dialog-textarea"
          placeholder="Report reason(Optional)"
          ref={contentRef}
        ></textarea>
      </div>
    </PopUpDialogBase>
  );
};

export default ReportDialog;