import "../assets/normalise.css"
import "./styles/style_infobackground.css";
import { useDispatch, useSelector } from "react-redux";
import { type RootState, type AppDispatch } from "../store";
import { useEffect } from "react";
import BackgroundImg from "./BackgroundImg";

interface InfoBackgroundProps {
  src: string
}


const InfoBackground = (props: InfoBackgroundProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoggedIn, name, avatarLink, backgroundLink, role, email, id, intro } = useSelector((state: RootState) => state.user);


  return (
    <BackgroundImg src={backgroundLink} >
      <div className="info-container">
        <div className="info">
          <img src={avatarLink} alt="Avatar Image" />
          <div className="info-combo">
            <h4> <span>{role}</span> {name}</h4>
            <p>id: {id} | email: {email}</p>
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