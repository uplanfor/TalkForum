/**
 * 举报对话框组件
 * 用于用户提交举报信息，支持选择举报类型和填写举报原因
 * 
 * 该组件使用PopUpDialogBase作为基础对话框，通过节流函数防止用户频繁提交
 * 举报，支持自定义对话框标题和初始举报内容。
 */
// import "../assets/normalize.css"
import "./styles/style_reportdialog.css"
import PopUpDialogBase from "./PopUpDialogBase"
import { type PopUpDialogButton } from "./PopUpDialogBase"
import { useEffect, useRef } from "react";
import { throttle } from "../utils/debounce&throttle";
import { ReportTypeEnum } from "../constants/report_constant";

/**
 * 举报对话框属性接口
 */
interface ReportDialogProps {
  /**
   * 关闭对话框的回调函数
   */
  onClose: () => void;
  /**
   * 对话框标题通知，默认为"Report"
   */
  notification?: string;
  /**
   * 举报内容，默认为空字符串
   */
  content?: string;
  /**
   * 举报对象的ID
   */
  reportId: number;
}

/**
 * 举报对话框组件
 * 用于用户提交举报，选择举报类型并填写举报原因
 * @param {ReportDialogProps} props - 组件属性
 */
const ReportDialog = ({ onClose, notification = "Report", content = "" }: ReportDialogProps) => {
  // 举报内容文本域引用，用于获取用户输入的举报原因
  const contentRef = useRef<HTMLTextAreaElement>(null);

  /**
   * 节流处理的举报提交函数
   * 防止用户频繁提交举报，目前是一个待实现的占位函数
   */
  const throttleReport = throttle(async () => {
    if (!contentRef.current) { return; }
    // TODO: 调用举报API提交举报信息
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

  /**
   * 组件挂载时初始化举报内容
   */
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
        {/* 举报原因标题 */}
        <div className="report-reasons-header">
          <h3>Report Reasons</h3>
          <p>Choose report type.</p>
        </div>
        {/* 举报原因选项网格 */}
        <div className="report-reasons-grid">
          {/* 遍历举报类型枚举，生成单选按钮 */}
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
      {/* 举报内容输入区域 */}
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