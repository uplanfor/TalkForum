/**
 * 邀请码操作对话框组件
 * 用于创建和更新邀请码的对话框，基于PopUpDialogBase实现
 */
import "./styles/style_invitecodedialog.css";
import PopUpDialogBase, { type PopUpDialogButton } from "./PopUpDialogBase";
import { useState } from "react";
import { 
  adminUpdateInviteCodes,
  adminGenerateInviteCodes
} from "../api/ApiInvitecode";
import Msg from "../utils/msg";

/**
 * 邀请码对话框类型
 */
export type InviteCodeDialogType = "create" | "update";

/**
 * 邀请码对话框属性接口
 */
interface InviteCodeDialogProps {
  type: InviteCodeDialogType;           // 对话框类型：创建或更新
  isOpen: boolean;                      // 是否打开对话框
  onClose: () => void;                  // 关闭对话框回调
  selectedCodes?: string[];             // 选中的邀请码列表（更新时需要）
  onSuccess?: () => void;               // 操作成功回调
}

/**
 * 邀请码对话框组件
 */
const InviteCodeDialog: React.FC<InviteCodeDialogProps> = ({
  type,
  isOpen,
  onClose,
  selectedCodes = [],
  onSuccess
}) => {
  // 表单状态
  const [maxCount, setMaxCount] = useState("");
  const [expiredDays, setExpiredDays] = useState("");
  const [generateCount, setGenerateCount] = useState(""); // 仅创建时使用
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 重置表单
  const resetForm = () => {
    setMaxCount("");
    setExpiredDays("");
    setGenerateCount("");
    setIsSubmitting(false);
  };

  // 关闭对话框
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // 验证表单
  const validateForm = () => {
    if (!maxCount || !expiredDays) {
      Msg.error("Max usage count and expiration days are required");
      return false;
    }

    const maxCountNum = parseInt(maxCount);
    const expiredDaysNum = parseInt(expiredDays);

    if (isNaN(maxCountNum) || maxCountNum < 1) {
      Msg.error("Max usage count must be a positive number");
      return false;
    }

    if (isNaN(expiredDaysNum) || expiredDaysNum < 1) {
      Msg.error("Expiration days must be a positive number");
      return false;
    }

    // 创建模式下需要验证生成数量
    if (type === "create") {
      if (!generateCount) {
        Msg.error("Generate count is required");
        return false;
      }

      const generateCountNum = parseInt(generateCount);
      if (isNaN(generateCountNum) || generateCountNum < 1) {
        Msg.error("Generate count must be a positive number");
        return false;
      }
    }

    return true;
  };

  // 处理提交
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const maxCountNum = parseInt(maxCount);
      const expiredDaysNum = parseInt(expiredDays);

      if (type === "create") {
        // 创建邀请码
        const generateCountNum = parseInt(generateCount);
        const res = await adminGenerateInviteCodes(maxCountNum, expiredDaysNum, generateCountNum);
        
        if (res.success) {
          Msg.success(res.message || `${generateCountNum} invite codes created successfully`);
          handleClose();
          onSuccess?.();
        } else {
          throw new Error(res.message);
        }
      } else {
        // 更新邀请码
        if (selectedCodes.length === 0) {
          Msg.error("No invite codes selected for update");
          setIsSubmitting(false);
          return;
        }

        const res = await adminUpdateInviteCodes(selectedCodes, maxCountNum, expiredDaysNum);
        
        if (res.success) {
          Msg.success(res.message || "Invite codes updated successfully");
          handleClose();
          onSuccess?.();
        } else {
          throw new Error(res.message);
        }
      }
    } catch (error: any) {
      Msg.error(error.message || `${type === "create" ? "Create" : "Update"} failed`);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 底部按钮配置
  const bottomButtons: PopUpDialogButton[] = [
    {
      text: "Cancel",
      onClick: handleClose,
      type: "cancel"
    },
    {
      text: type === "create" ? "Create Invite Codes" : "Update Invite Codes",
      onClick: handleSubmit,
      type: "submit"
    }
  ];

  // 如果对话框未打开，返回null
  if (!isOpen) {
    return null;
  }

  return (
    <PopUpDialogBase
      title={type === "create" ? "Create New Invite Codes" : "Update Invite Codes"}
      onClose={handleClose}
      bottomBtns={bottomButtons}
    >
      <div className="invite-code-dialog-form">
        <div className="form-group">
          <label>Max Usage Count *</label>
          <input
            type="number"
            value={maxCount}
            onChange={(e) => setMaxCount(e.target.value)}
            min="1"
            placeholder="Enter max usage count"
            disabled={isSubmitting}
          />
        </div>
        <div className="form-group">
          <label>Expiration Days *</label>
          <input
            type="number"
            value={expiredDays}
            onChange={(e) => setExpiredDays(e.target.value)}
            min="1"
            placeholder="Enter expiration days"
            disabled={isSubmitting}
          />
        </div>
        {type === "create" && (
          <div className="form-group">
            <label>Generate Count *</label>
            <input
              type="number"
              value={generateCount}
              onChange={(e) => setGenerateCount(e.target.value)}
              min="1"
              placeholder="Enter number of codes to generate"
              disabled={isSubmitting}
            />
          </div>
        )}
        <div className="form-note">All fields marked with * are required</div>
      </div>
    </PopUpDialogBase>
  );
};

export default InviteCodeDialog;