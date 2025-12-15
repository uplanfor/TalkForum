/**
 * 个人资料对话框组件
 * 用于显示和编辑用户的个人资料信息，包括：
 * - 基本信息（用户名、简介）
 * - 头像和背景图片
 * - 密码修改
 * 
 * 该组件使用PopUpDialogBase作为基础对话框，通过Redux管理用户状态，
 * 并调用API完成资料更新和密码修改功能。
 */
// import "../assets/normalize.css"
import "./styles/style_profiledialog.css"
import PopUpDialogBase from "./PopUpDialogBase"
import { type PopUpDialogButton } from "./PopUpDialogBase"
import { useRef } from "react"
import { useDispatch, useSelector } from "react-redux";
import { type RootState, type AppDispatch } from "../store";
import { userLogout, userLogin } from "../store/slices/userSlice";
import { Navigate, useNavigate } from "react-router-dom"
import { UserType } from "../constants/default";
import { debounce } from "../utils/debounce&throttle";
import Msg from "../utils/msg";
import { usersChangePasswordAuth, usersUpdateProfileAuth, type UserProfile } from "../api/ApiUsers";
import { getMyInvitecodes } from "../api/ApiInvitecode";
import dayjs from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * 个人资料对话框属性接口
 */
interface ProfileDialogProps {
  /**
   * 关闭对话框的回调函数
   */
  onClose: () => void;
}

/**
 * 个人资料对话框组件
 * 用于显示和编辑用户的个人资料信息
 */
const ProfileDialog = ({ onClose }: ProfileDialogProps) => {
  const dispatch = useDispatch<AppDispatch>();
  // 从Redux store中获取用户信息
  const showState = useSelector((state: RootState) => state.user);
  // 路由导航钩子
  const navigate = useNavigate();
  // 国际化钩子
  const { t } = useTranslation();
  // 表单引用，用于获取表单数据
  const formRef = useRef<HTMLFormElement>(null);
  // 密码输入框引用，用于获取密码输入值
  const oldPasswordRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  // 头像链接输入框引用
  const avatarLinkRef = useRef<HTMLInputElement>(null);
  // 背景链接输入框引用
  const backgroundLinkRef = useRef<HTMLInputElement>(null);
  // 系统默认头像弹窗状态
  const [showAvatarPopup, setShowAvatarPopup] = useState(false);
  // 系统预设头像列表
  const systemAvatars = [
    "https://pic1.imgdb.cn/item/6905cbfa3203f7be00bf6e98.webp",
    "https://pic1.imgdb.cn/item/6905cbfa3203f7be00bf6e99.webp",
    "https://pic1.imgdb.cn/item/6905cb483203f7be00bf6bf4.webp",
    "https://pic1.imgdb.cn/item/6905cbca3203f7be00bf6e31.webp",
    "https://pic1.imgdb.cn/item/6905cbca3203f7be00bf6e32.webp",
    "https://pic1.imgdb.cn/item/6905cbca3203f7be00bf6e33.webp",
    "https://pic1.imgdb.cn/item/6905cbca3203f7be00bf6e34.webp",
    "https://pic1.imgdb.cn/item/6905cbca3203f7be00bf6e35.webp",
    "https://pic1.imgdb.cn/item/6905cb483203f7be00bf6bf1.webp",
    "https://pic1.imgdb.cn/item/6905cb483203f7be00bf6bf2.webp",
    "https://pic1.imgdb.cn/item/6905cb483203f7be00bf6bf3.webp",
    "https://pic1.imgdb.cn/item/6905cb483203f7be00bf6bf5.webp",
    "https://pic1.imgdb.cn/item/6905cb483203f7be00bf6bf6.webp"
  ];
  // 如果用户未登录，跳转到登录页面
  if (!showState.isLoggedIn) { return <Navigate to="/login" /> }

  /**
   * 验证图片URL是否有效
   * @param url - 图片URL
   * @returns 是否有效
   */
  const isValidImageUrl = (url: string): boolean => {
    // 空字符串允许（表示不设置图片）
    if (!url) return true;
    
    // 检查是否为http或https链接
    // 不强制要求文件扩展名，支持查询参数
    const httpRegex = /^https?:\/\/[^\s]+$/i;
    // 检查是否为base64图片
    // 支持更多图片格式，包括SVG
    const base64Regex = /^data:image\/(png|jpeg|jpg|gif|webp|svg);base64,/i;
    
    return httpRegex.test(url) || base64Regex.test(url);
  };

  /**
   * 处理表单提交
   * 更新用户资料
   * @param e - 表单提交事件
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) { return; }

    // 收集表单数据
    const formData = new FormData(formRef.current);
    
    // 验证图片链接
    const avatarLink = formData.get("avatarLink") as string;
    const backgroundLink = formData.get("backgroundLink") as string;
    
    if (!isValidImageUrl(avatarLink)) {
      Msg.error(t('profileDialog.invalidAvatarUrl'));
      return;
    }
    
    if (!isValidImageUrl(backgroundLink)) {
      Msg.error(t('profileDialog.invalidBackgroundUrl'));
      return;
    }

    const submitData: UserProfile = {
      name: formData.get("name") as string,
      intro: formData.get("intro") as string,
      avatarLink: avatarLink,
      backgroundLink: backgroundLink
    };

    // 调用API更新用户资料
    await usersUpdateProfileAuth(submitData).then((res) => {
      if (res.success) {
        Msg.success(t('profileDialog.updateSuccess'));
        // 更新Redux store中的用户信息
        dispatch(userLogin({ ...showState, ...submitData }));
      } else {
        Msg.error(res.message, 5000);
      }
    });
  };

  /**
   * 选择系统默认头像
   * @param avatarUrl - 选择的头像URL
   */
  const selectSystemAvatar = (avatarUrl: string) => {
    if (avatarLinkRef.current) {
      avatarLinkRef.current.value = avatarUrl;
    }
    setShowAvatarPopup(false);
  };

  /**
   * 处理密码修改
   * @param e - 按钮点击事件
   */
  const changePassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    await changePasswordWithSafety();
  }

  // 防抖处理表单提交，避免频繁提交
  const debounceHandleSubmit = debounce(() => {
    formRef.current?.requestSubmit();
  }, 300);

  /**
   * 安全修改密码
   * 使用防抖处理，避免频繁提交
   */
  const changePasswordWithSafety = debounce(async () => {
    if (!oldPasswordRef.current || !newPasswordRef.current) { return; }
    const oldPassword = oldPasswordRef.current.value;
    const newPassword = newPasswordRef.current.value;
    if (!oldPassword || !newPassword) {
      Msg.error(t('profileDialog.passwordRequired'));
      return;
    }
    // 调用API修改密码
    const res = await usersChangePasswordAuth(oldPassword, newPassword);
    if (res.success) {
      Msg.success(t('profileDialog.passwordChangeSuccess'));
      // 跳转到登录页面并登出
      navigate("/login");
      dispatch(userLogout());
    } else {
      Msg.error(res.message, 5000);
    }
  }, 300);

  // 对话框底部按钮配置
  const bottomBtns: PopUpDialogButton[] = [
    {
      text: t('profileDialog.cancelButton'),
      onClick: () => {
        onClose();
      },
      type: "cancel"
    },
    {
      text: t('profileDialog.commitButton'),
      onClick: debounceHandleSubmit,
      type: "submit"
    }
  ];

  // 展示所有邀请码配置
  const showMyInviteCodes = async (e: React.MouseEvent) => {
    e.preventDefault();
    await getMyInvitecodes().then((res) => {
      if (res.success) {
        Msg.confirm(`Here are your invite codes:\n ${
          res.data.map(item => {
            const diff = dayjs(item.expiredAt).diff(dayjs(), "days");
            return diff > 0 ? `${item.code} (used ${item.usedCount}/${item.maxCount} expired at ${diff} days)` : 
            `${item.code} (expired)`
          }
            ).join("\n")
        }.`);
      } else {
        throw new Error(res.message);
      }
    }).catch(err => {
      Msg.error(err.message, 5000);
    });
  }

  /**
   * 处理背景图片加载错误
   * @param e - 图片错误事件
   */
  const handleImgBackgroundError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/";
    e.currentTarget.onerror = null;
  };

  /**
   * 处理头像图片加载错误
   * @param e - 图片错误事件
   */
  const handleImgAvatarError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/";
    e.currentTarget.onerror = null;
  };

  return (
    <PopUpDialogBase
      title={t('profileDialog.title')}
      onClose={onClose}
      bottomBtns={bottomBtns}
    >
      <form ref={formRef} onSubmit={handleSubmit} autoComplete="off">
        <div className="profile-dialog-container">
          {/* 背景图片和用户信息卡片 */}
          <div className="background-view" onError={handleImgBackgroundError}>
            <img src={showState.backgroundLink} alt="background" />
            <div className="info-card">
              <img src={showState.avatarLink} alt="avatar" onError={handleImgAvatarError} />
              <div className="combination">
                <h4>
                  {/* 用户角色标签，根据角色显示不同颜色 */}
                  <span style={{
                    background: (showState.role == (UserType.ADMIN) ? "var(--primary)" : showState.role == UserType.USER ? "var(--secondary-warm-1)" : "var(--secondary-cool)")
                  }}>{showState.role}</span>
                  {showState.name}
                </h4>
                <p>id : {showState.id}  email : {showState.email}</p>
              </div>
            </div>
          </div>

          {/* 基本信息编辑区域 */}
          <h2>{t('profileDialog.basicInfo')}</h2>
          <p><label htmlFor="name">{t('profileDialog.name')}</label> <input type="text" placeholder={t('profileDialog.namePlaceholder')} name="name" id="name" defaultValue={showState.name} /></p>
          <p><label htmlFor="role">{t('profileDialog.role')}</label> <input type="text" placeholder={t('profileDialog.rolePlaceholder')} name="role" id="role" defaultValue={showState.role} disabled /></p>
          <p><label htmlFor="email">{t('profileDialog.email')}</label> <input type="text" placeholder={t('profileDialog.emailPlaceholder')} name="email" id="email" defaultValue={showState.email} disabled /></p>
          <p><label htmlFor="introduction">{t('profileDialog.introduction')}</label></p> <textarea placeholder={t('profileDialog.introductionPlaceholder')} name="introduction" id="introduction" defaultValue={showState.intro} ></textarea>

          {/* 背景和头像编辑区域 */}
          <h2>{t('profileDialog.backgroundAndAvatar')}</h2>
          <p>
            <label htmlFor="avatarLink">{t('profileDialog.avatar')}</label> 
            <input 
              type="text" 
              placeholder={t('profileDialog.avatarPlaceholder')} 
              name="avatarLink" 
              id="avatarLink" 
              defaultValue={showState.avatarLink} 
              ref={avatarLinkRef}
            />
            <button 
              type="button" 
              onClick={() => setShowAvatarPopup(true)} 
              className="system-avatar-btn"
            >
              {t('profileDialog.chooseSystemAvatar')}
            </button>
          </p>
          <p>
            <label htmlFor="backgroundLink">{t('profileDialog.background')}</label> 
            <input 
              type="text" 
              placeholder={t('profileDialog.backgroundPlaceholder')} 
              name="backgroundLink" 
              id="backgroundLink" 
              defaultValue={showState.backgroundLink} 
              ref={backgroundLinkRef}
            />
          </p>
          
          {/* 系统默认头像弹窗 */}
          {showAvatarPopup && (
            <div className="system-avatar-popup">
              <div className="system-avatar-popup-content">
                <h3>{t('profileDialog.chooseAvatarFrame')}</h3>
                <div className="avatar-options">
                  {systemAvatars.map((avatarUrl, index) => (
                    <div 
                      key={index} 
                      className="avatar-option"
                      onClick={() => selectSystemAvatar(avatarUrl)}
                    >
                      <img src={avatarUrl} alt={`Avatar ${index + 1}`} />
                    </div>
                  ))}
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowAvatarPopup(false)} 
                  className="close-btn"
                >
                  {t('profileDialog.close')}
                </button>
              </div>
            </div>
          )}

          {/* 密码修改区域 */}
          <h2>{t('profileDialog.changePassword')}</h2>
          <p><label htmlFor="oldPassword">{t('profileDialog.oldPassword')}</label> <input type="password" placeholder={t('profileDialog.oldPasswordPlaceholder')} name="oldPassword" id="oldPassword" ref={oldPasswordRef} /></p>
          <p><label htmlFor="newPassword">{t('profileDialog.newPassword')}</label> <input type="password" placeholder={t('profileDialog.newPasswordPlaceholder')} name="newPassword" id="newPassword" ref={newPasswordRef} /></p>
          <button onClick={changePassword}>{t('profileDialog.changePasswordButton')}</button>

          {/* 邀请码区域*/}
          <h2>{t('profileDialog.inviteCodes')}</h2>
          <button onClick={showMyInviteCodes}>{t('profileDialog.seeInviteCodes')}</button>
        </div>
      </form>
    </PopUpDialogBase>
  );
};

export default ProfileDialog;