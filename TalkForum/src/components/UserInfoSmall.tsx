import "../assets/normalise.css"
import "./styles/style_userinfosmall.css"

import {useDispatch, useSelector} from "react-redux";
import { type RootState, type AppDispatch } from "../store";
import { userLogin } from "../store/slices/userSlice";

const UserInfoSmall = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {isLoggedIn, name, avatarLink} = useSelector((state: RootState) => state.user);


  return (
    <div className="user-info-small">
       { !isLoggedIn ? (<span>{name}</span>) : (<button className="login-button">Login</button>) }
        
        <img src={avatarLink} alt="Failed" />
    </div>
  )
}

export default UserInfoSmall;