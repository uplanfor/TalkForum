import "../assets/normalise.css"
import "./styles/style_backgroundimg.css"
import React from "react";

interface BackgroundImgProps {
    src: string;
    style?: React.CSSProperties;
}

const BackgroundImg = (props : BackgroundImgProps) => {
    const { src, style } = props;
    return <img className="background-img" src={src} style={style}/>
}


export default BackgroundImg;