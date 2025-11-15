import "../assets/normalise.css"
import "./styles/style_userinfosmall.css"

import {useDispatch, useSelector} from "react-redux";
import { type RootState, type AppDispatch } from "../store";
// import { userLogin } from "../store/slices/userSlice";
import { useNavigate } from "react-router-dom";

const UserInfoSmall = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {isLoggedIn, name, avatarLink} = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();

  const toLogin = () => {
    navigate("/login");
  }

  return (
    <div className={`user-info-small ${isLoggedIn ? "logged-in" : "logged-out"}`}>
       { isLoggedIn ? (<span>{name}</span>) : (<button className="login-button" onClick={toLogin}>Login</button>) }
        
        <img src={avatarLink} alt="Failed" />
    </div>
  )
}

export default UserInfoSmall;