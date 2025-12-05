// import "../assets/normalize.css"
import "./styles/style_infobackground.css";
import { useDispatch, useSelector } from "react-redux";
import { type RootState, type AppDispatch } from "../store";
import { DefaultAvatarUrl, InfoBackgroundType } from "../constants/default";
import { UserType } from "../constants/default";
import { useEffect, useState } from "react";
import BackgroundImg from "./BackgroundImg";
import dayjs from "dayjs";
import { usersGetDetailedUserInfo, type UserVO } from "../api/ApiUsers";
import { changeUserFollowing } from "../store/slices/userSlice";
import Msg from "../utils/msg";
import { interactionsFollowOrUnfollowUser } from "../api/ApiInteractions";

/**
 * 信息背景组件属性接口
 */
interface InfoBackgroundProps {
  /**
   * 目标类型，使用InfoBackgroundType里的常量值
   * SELF表示展示自己，CLUB展示圈子，USER展示用户
   */
  targetType: typeof InfoBackgroundType[keyof typeof InfoBackgroundType];
  /**
   * 目标ID（可选）
   */
  targetId: number;
}

/**
 * 信息背景组件
 * 用于显示用户或俱乐部的信息背景，包含头像、名称、角色、简介等信息
 */
const InfoBackground = (props: InfoBackgroundProps) => {
  const dispatch = useDispatch<AppDispatch>();
  // 从Redux store中获取当前用户信息
  const { isLoggedIn, lastLoginAt, name, avatarLink,
    backgroundLink, role, email, id,
    intro,
    fansCount, followingCount, following } = useSelector((state: RootState) => state.user);

  const targetType = props.targetType;
  const targetId = targetType === InfoBackgroundType.SELF ? id : props.targetId;
  console.log(targetType, targetId);
  // 判断是否为当前用户
  let isSelf = (targetType === InfoBackgroundType.SELF && isLoggedIn) || (targetType === InfoBackgroundType.USER && isLoggedIn && targetId == id);

  // 其他用户信息状态
  const [otherUser, setOtherUser] = useState<UserVO | null>(null);


  // 实现关注功能
  const handleFollow = async () => {
    if (isLoggedIn) {
      if (targetId != null) {
        const isCurrentlyFollowing = following.includes(targetId);
        
        await interactionsFollowOrUnfollowUser(targetId, !isCurrentlyFollowing).then(res => {
          if (res.success) {
            Msg.success(res.message);
            dispatch(changeUserFollowing(targetId));
            
            // 本地更新粉丝数和关注人数
            if (isSelf) {
              // 如果是查看自己的页面，不需要额外更新，因为changeUserFollowing已经处理了
            } else if (targetType === InfoBackgroundType.USER && otherUser) {
              // 如果是查看其他用户页面，更新其他用户的粉丝数
              setOtherUser(prev => {
                if (!prev) return null;
                return {
                  ...prev,
                  fansCount: isCurrentlyFollowing ? prev.fansCount - 1 : prev.fansCount + 1
                };
              });
            }
          } else {
            throw new Error(res.message)
          }
        }).catch(err => {
          Msg.error(err.message);
        });
      } else {
        Msg.error("Please sign in!");
      }
    }
  }

  // 当targetId变化且不是当前用户时，获取其他用户信息
  useEffect(() => {
    if (targetId && !isSelf && targetType === InfoBackgroundType.USER) {
      usersGetDetailedUserInfo(targetId)
        .then(res => {
          if (res.success) {
            setOtherUser(res.data);
          }
        })
        .catch(err => {
          console.error("Failed to get user info:", err);
        });
    } else {
      setOtherUser(null);
    }
  }, [targetId, isSelf, targetType]);

  // 根据是否为当前用户，选择要显示的用户信息
  const userInfo = isSelf ? {
    name: name,
    avatarLink: avatarLink,
    backgroundLink: backgroundLink,
    role: role,
    email: email,
    id: id,
    intro: intro,
    fansCount: fansCount,
    followingCount: followingCount,
    lastLoginAt: lastLoginAt
  } : otherUser;

  // 如果是SELF类型但未登录，显示保留的用户信息卡片
  if (targetType === InfoBackgroundType.SELF && !isLoggedIn) {
    // 默认用户信息
    const defaultUserInfo = {
      name: "Guest User",
      avatarLink: DefaultAvatarUrl, // 默认头像
      role: UserType.USER,
      id: 0,
      intro: "Please login to view and edit your profile information.",
      fansCount: 0,
      followingCount: 0
    };

    return (
      <BackgroundImg src={backgroundLink} style={{ height: 430 }}>
        <div className="info-container">
          <div className="info">
            {/* 默认用户头像 */}
            <img src={defaultUserInfo.avatarLink} alt="Default Avatar" />
            <div className="info-combo">
              {/* 用户名和默认角色标签 */}
              <h4>
                <span style={{ background: "var(--secondary-warm-1)" }}>
                  {defaultUserInfo.role}
                </span>
                {defaultUserInfo.name}
              </h4>
              {/* 默认用户详细信息 */}
              <p>id: {defaultUserInfo.id}<br />
                {defaultUserInfo.followingCount} Following {defaultUserInfo.fansCount} Followers
              </p>
            </div>
          </div>
          {/* 默认用户简介 */}
          <div className="intro">
            {defaultUserInfo.intro}
          </div>
        </div>
      </BackgroundImg>
    );
  }

  // 如果是俱乐部类型，暂时显示TODO
  if (targetType === InfoBackgroundType.CLUB) {
    // TODO: 实现俱乐部信息显示
    return (
      <BackgroundImg src={backgroundLink} style={{ height: 430 }}>
        <div className="info-container">
          <div className="info">
            <div className="info-combo">
              <h4>Club</h4>
            </div>
          </div>
        </div>
      </BackgroundImg>
    );
  }

  // 如果是用户类型，但用户信息未加载完成
  if (!userInfo) {
    return (
      <BackgroundImg src={backgroundLink} style={{ height: 430 }}>
        <div className="info-container">
          <div className="info">
            <div className="info-combo">
              <h4>loading...</h4>
            </div>
          </div>
        </div>
      </BackgroundImg>
    );
  }

  return (
    <BackgroundImg src={userInfo.backgroundLink} style={{ height: 430 }}>
      {/* 信息容器 */}
      <div className="info-container">
        <div className="info">
          {/* 关注按钮 */}
          <button className={`info-interact-button ${following.includes(targetId) ? "following" : "follow"}`} onClick={handleFollow}>{following.includes(targetId) ? "Following" : "Follow"}</button>
          {/* 用户头像 */}
          <img src={userInfo.avatarLink} alt="Avatar Image" />
          <div className="info-combo">
            {/* 用户名和角色标签 */}
            <h4>
              <span style={{
                background: (userInfo.role == (UserType.ADMIN) ? "var(--primary)" : userInfo.role == UserType.USER ? "var(--secondary-warm-1)" : "var(--secondary-cool)")
              }}>{userInfo.role}</span>
              {userInfo.name}
            </h4>
            {/* 用户详细信息 */}
            {/* 显示规则：
                - 所有用户（登录/未登录）都能看到其他用户的基本信息
                - 只有登录用户能看到自己的完整信息（包括邮箱）
                - 只有登录用户能看到自己的最后登录时间
              */}
            <p> id: {userInfo.id} {isSelf && `email: ${userInfo.email}`} <br />
              {isLoggedIn && userInfo.lastLoginAt && (
                <>
                  Last Login At: {dayjs(userInfo.lastLoginAt).format("HH:mm:ss MMMM DD, YYYY")}
                  <br />
                </>
              )}
              {userInfo.followingCount} Following {userInfo.fansCount} Followers
            </p>
          </div>
        </div>
        {/* 用户简介 */}
        <div className="intro">
          {userInfo.intro}
        </div>
      </div>
    </BackgroundImg>
  );
};


export default InfoBackground;