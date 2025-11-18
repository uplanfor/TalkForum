import "../assets/normalize.css"
import "./styles/style_backgroundimg.css"
import React from "react";

interface BackgroundImgProps {
    src: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
}
// 原接口缺少 children 定义


const BackgroundImg = (props : BackgroundImgProps) => {
    const { src, style, children } = props;
    return <div className="background-img-container"  style={style}>
        <img className="background-img" src={src} alt="Background" />
        {children}
    </div>;
}


export default BackgroundImg;