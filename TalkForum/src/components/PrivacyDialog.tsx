/**
 * 隐私政策对话框组件
 * 基于PopUpDialogBase封装，用于显示TalkForum的隐私政策内容
 */
import React from "react";
import PopUpDialogBase from "./PopUpDialogBase";
import "./styles/style_privacy_dialog.css";

interface PrivacyDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 隐私政策对话框组件
 * @param {PrivacyDialogProps} props - 组件属性
 * @returns {JSX.Element} 隐私政策对话框组件
 */
const PrivacyDialog: React.FC<PrivacyDialogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <PopUpDialogBase
      title="TalkForum Privacy Policy"
      onClose={onClose}
      showCloseIcon={true}
    >
      <div className="privacy-dialog-content">
        <h3>1. Information We Collect</h3>
        <p>
          We collect information you provide directly to us, such as when you create an account, 
          post content, or communicate with us. This may include your name, email address, 
          and any other information you choose to provide.
        </p>
        
        <h3>2. How We Use Your Information</h3>
        <p>
          We use the information we collect to provide, maintain, and improve our services, 
          process transactions, send you technical notices and support messages, and communicate 
          with you about products, services, and promotional offers.
        </p>
        
        <h3>3. Information Sharing</h3>
        <p>
          We do not sell, trade, or otherwise transfer your personal information to third parties 
          without your consent, except as described in this privacy policy. We may share your 
          information with trusted third parties who assist us in operating our website and services.
        </p>
        
        <h3>4. Data Security</h3>
        <p>
          We implement appropriate technical and organizational measures to protect your personal 
          information against unauthorized access, alteration, disclosure, or destruction.
        </p>
        
        <h3>5. Your Rights</h3>
        <p>
          You have the right to access, update, or delete your personal information. You may also 
          object to processing of your personal information, ask us to restrict processing of your 
          information, or request portability of your information.
        </p>
        
        <h3>6. Changes to This Policy</h3>
        <p>
          We may update our privacy policy from time to time. We will notify you of any changes 
          by posting the new privacy policy on this page and updating the "Last updated" date.
        </p>
        
        <p className="privacy-last-updated">Last updated: January 1, 2024</p>
      </div>
    </PopUpDialogBase>
  );
};

export default PrivacyDialog;