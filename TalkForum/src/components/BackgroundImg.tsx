// import "../assets/normalize.css"
import "./styles/style_backgroundimg.css"
import React from "react";
import { DefaultBackgroundUrl } from "../constants/default";
import Msg from "../utils/msg";

interface BackgroundImgProps {
    src: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
}


const BackgroundImg = (props : BackgroundImgProps) => {
    const { src, style, children } = props;
    const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        Msg.error("The user's background is broken.Please check the background image.")
        e.currentTarget.src = DefaultBackgroundUrl;
    }
    return <div className="background-img-container"  style={style}>
        <img className="background-img" src={src} alt="Background" onError={handleImgError}/>
        {children}
    </div>;
}


export default BackgroundImg;