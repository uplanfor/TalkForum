// import "../assets/normalize.css"
import "./styles/style_infobackground.css";
import { useDispatch, useSelector } from "react-redux";
import { type RootState, type AppDispatch } from "../store";
import { InfoBackgroundType } from "../constants/default";
import { UserType } from "../constants/default";
import { useEffect } from "react";
import BackgroundImg from "./BackgroundImg";
import dayjs from "dayjs";

interface InfoBackgroundProps {
  infoType: string;
  targetId?: number;
}


const InfoBackground = (props: InfoBackgroundProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoggedIn, lastLoginAt, name, avatarLink, backgroundLink, role, email, id, intro, fansCount } = useSelector((state: RootState) => state.user);
  let { infoType, targetId } = props;
  let isSelf = (infoType === InfoBackgroundType.SELF) ||  (infoType === InfoBackgroundType.USER && targetId == id);


  return (
    <BackgroundImg src={backgroundLink} style={{height: 430}}>
      <div className="info-container">
        <div className="info">
          <img src={avatarLink} alt="Avatar Image" />
          <div className="info-combo">
            <h4> <span style={{
              background: (role == (UserType.ADMIN) ? "var(--primary)" : role == UserType.USER ?  "var(--secondary-warm-1)": "var(--secondary-cool)")
            }}>{role}</span> {name} </h4>
            {isLoggedIn &&
            (<p>{isSelf ? InfoBackgroundType.USER : infoType} id: {id} email: {email} followers : {fansCount}
              <br/>{lastLoginAt? `Last Login At: ${dayjs(lastLoginAt).format("HH:mm:ss MMMM DD, YYYY")}` : "Never logged in"}</p>)}
          </div>
        </div>
        <div className="intro">
          {intro}
        </div>
      </div>
    </BackgroundImg>
  );
};


export default InfoBackground;