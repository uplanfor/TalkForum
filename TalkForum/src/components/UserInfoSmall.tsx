// import "../assets/normalize.css"
import "./styles/style_userinfosmall.css"

import { useDispatch, useSelector } from "react-redux";
import { type RootState, type AppDispatch } from "../store";
import { userLogout } from "../store/slices/userSlice";
import SettingDialog from "./SettingDialog";
import ProfileDialog from "./ProfileDialog";
// import { userLogin } from "../store/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { createPortal } from "react-dom";
import Msg from "../utils/msg"
import { authSignOut } from "../api/ApiAuth";

interface UserInfoSmallProps {
  style?: React.CSSProperties;
}

const UserInfoSmall = ({style}: UserInfoSmallProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoggedIn, name, avatarLink } = useSelector((state: RootState) => state.user);
  const [settingDialogVisible, setSettingDialogVisible] = useState(false);
  const [profileDialogVisible, setProfileDialogVisible] = useState(false);
  const navigate = useNavigate();

  const toLogin = () => {
    navigate("/login");
  }

  const toSignOut = async () => {
    await authSignOut();
    dispatch(userLogout());
    Msg.success("Sign out successfully");
  };

  return (
    <>
      <div className={`user-info-small ${isLoggedIn ? "logged-in" : "logged-out"}`} style={style}>
        {isLoggedIn ? (<span>{name}</span>) : (<button className="login-button" onClick={toLogin}>Login</button>)}
        <div className="img-t">
          <img src={avatarLink} alt="Failed" />
        </div>
        {isLoggedIn && (<ul className="menu">
          <li onClick={() => setProfileDialogVisible(true)} >My Profile</li>
          <li onClick={() => setSettingDialogVisible(true)}>Settings</li>
          <li onClick={toSignOut}>Sign Out</li>
        </ul>)}
      </div>
      {/* 终于解决遮挡问题了，写在root节点那里 */}
      {settingDialogVisible && createPortal(
        <SettingDialog onClose={() => setSettingDialogVisible(false)} />,
        document.body
      )}
      {profileDialogVisible && createPortal(
        <ProfileDialog onClose={() => setProfileDialogVisible(false)} />,
        document.body
      )}

    </>

  )
}

export default UserInfoSmall;