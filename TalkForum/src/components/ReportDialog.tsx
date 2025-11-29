// import "../assets/normalize.css"
import "./styles/style_reportdialog.css"
import PopUpDialogBase from "./PopUpDialogBase"
import { type PopUpDialogButton } from "./PopUpDialogBase"
import { useEffect, useRef, useState } from "react";
import Msg from "../utils/Msg";
import { postsCommitPostAuth } from "../api/ApiPosts";
import { throttle } from "../utils/debounce&throttle";


interface ReportDialogProps {
  onClose: () => void;
  notification: string;
  content: string;
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
          <label htmlFor="IllegalContent_01">
            <input type="radio" name="IllegalContent" id="IllegalContent_01" value="stateSecurity" />
            <span>State security</span>
          </label>
          <label htmlFor="IllegalContent_02">
            <input type="radio" name="IllegalContent" id="IllegalContent_02" value="pornOrVulgar" />
            <span>Porn or vulgar</span>
          </label>
          <label htmlFor="IllegalContent_03">
            <input type="radio" name="IllegalContent" id="IllegalContent_03" value="violentTerror" />
            <span>Violent terror</span>
          </label>
          <label htmlFor="IllegalContent_04">
            <input type="radio" name="IllegalContent" id="IllegalContent_04" value="falseRumorsSpam" />
            <span>False rumors & spam</span>
          </label>
          <label htmlFor="IllegalContent_05">
            <input type="radio" name="IllegalContent" id="IllegalContent_05" value="privacyBreach" />
            <span>Privacy breach</span>
          </label>
          <label htmlFor="IllegalContent_06">
            <input type="radio" name="IllegalContent" id="IllegalContent_06" value="illegalAdActivity" />
            <span>Illegal ad activity</span>
          </label>
          <label htmlFor="IllegalContent_07">
            <input type="radio" name="IllegalContent" id="IllegalContent_07" value="feudalSuperstition" />
            <span>Feudal superstition</span>
          </label>
          <label htmlFor="IllegalContent_08">
            <input type="radio" name="IllegalContent" id="IllegalContent_08" value="insultAndDiscrimination" />
            <span>Insult and discrimination</span>
          </label>
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