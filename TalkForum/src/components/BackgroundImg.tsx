// import "../assets/normalize.css"
import "./styles/style_backgroundimg.css"
import React from "react";
import { DefaultBackgroundUrl } from "../constants/default";
import Msg from "../utils/msg";

/**
 * 背景图片属性接口
 */
interface BackgroundImgProps {
    /**
     * 背景图片URL
     */
    src: string;
    /**
     * 可选的自定义样式
     */
    style?: React.CSSProperties;
    /**
     * 子组件
     */
    children?: React.ReactNode;
}

/**
 * 背景图片组件
 * 用于显示背景图片，并在图片加载失败时显示默认背景
 */
const BackgroundImg = (props : BackgroundImgProps) => {
    const { src, style, children } = props;

    /**
     * 处理图片加载失败事件
     * 当图片加载失败时，显示默认背景图片并提示错误信息
     * @param e - 图片错误事件对象
     */
    const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        Msg.error("The user's background is broken.Please check the background image.")
        e.currentTarget.src = DefaultBackgroundUrl;
    }

    return (
        <div className="background-img-container" style={style}>
            {/* 背景图片元素 */}
            <img className="background-img" src={src} alt="Background" onError={handleImgError}/>
            {/* 子组件 */}
            {children}
        </div>
    );
}


export default BackgroundImg;