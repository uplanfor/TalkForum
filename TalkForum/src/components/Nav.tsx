/**
 * 导航栏组件
 * 网站的顶部导航栏和底部导航栏
 * 包含网站logo、导航链接、搜索框、用户信息和发布帖子功能
 */
// import "../assets/normalize.css"
import "./styles/style_nav.css"
import logoLink from "/logo.ico"
import UserInfoSmall from "./UserInfoSmall";
import SearchDialog from "./SearchDialog";
import PostDialog from "./PostDialog";
import { useState, type ReactNode } from "react";
import Msg from "../utils/msg";
import { Link, useNavigate } from "react-router-dom";
import { PlusIcon } from "@heroicons/react/24/solid";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { useSelector } from "react-redux";
import { type RootState } from "../store";

/**
 * 导航栏组件属性接口
 */
interface NavProps {
    changeColorTarget? : ReactNode;  // 颜色变化目标（可选）
    hasFooter? : boolean;            // 是否显示底部导航（可选，默认true）
}


/**
 * 导航栏组件
 * @param {NavProps} props - 组件属性
 */
const Nav = ({
    hasFooter = true,                // 是否显示底部导航，默认true
    changeColorTarget = null         // 颜色变化目标，默认null
}: NavProps) => {
    // 路由导航钩子
    const navigate = useNavigate();
    // 从Redux获取用户信息
    const user = useSelector((state: RootState) => state.user);
    
    // 搜索对话框可见性状态
    const [searchDialogVisible, setSearchDialogVisible] = useState(false);
    
    /**
     * 显示搜索对话框
     * 在移动端（宽度小于600px）显示搜索对话框
     */
    const showSearchDialog = () => {
        if (window.innerWidth < 600) {
            setSearchDialogVisible(true);
        }
    }
    
    // 发布帖子对话框可见性状态
    const [postDialogVisible, setPostDialogVisible] = useState(false);
    
    /**
     * 尝试显示发布帖子对话框
     * 如果用户已登录，则显示发布帖子对话框；否则提示登录
     */
    const tryShowPostDialog = () => {
        if (user.isLoggedIn) {
            setPostDialogVisible(true);
        } else {
            Msg.error("Please sign in first to write your post!");
            navigate("/login");
        }
    }
    
    return <>
        {/* 发布帖子对话框 */}
        {postDialogVisible && <PostDialog onClose={() => setPostDialogVisible(false)}></PostDialog>}
        {/* 搜索对话框 */}
        {searchDialogVisible && <SearchDialog onClose={() => setSearchDialogVisible(false)} />}
        
        {/* 顶部导航栏 */}
        <nav>
            {/* 网站logo */}
            <img src={logoLink} alt="Talk Forum" />
            {/* 网站标题 */}
            <span className="title">Talk Forum</span>
            
            {/* 导航链接 */}
            <ul>
                <li><Link to="/">Home</Link></li>
                {/* <li><Link to="/club">Club</Link></li>
                <li><Link to="/mail">Mail</Link></li> */}
                <li><Link to="/me">Me</Link></li>
            </ul>
            
            {/* 搜索框 */}
            <div className="search-container">
                <MagnifyingGlassIcon />
                <input type="text" placeholder="search for others' posts!" onClick={showSearchDialog} />
            </div>

            {/* 用户信息组件 */}
            <UserInfoSmall></UserInfoSmall>

        </nav>
        
        {/* 底部导航栏（如果需要显示） */}
        {hasFooter &&(<footer>
            {/* 底部导航链接 */}
            <ul>
                <li><Link to="/">Home</Link></li>
                {/* <li><Link to="/club">Club</Link></li> */}
                <li>{/* 占位 */}</li>
                {/* <li><Link to="/mail">Mail</Link></li> */}
                <li><Link to="/me">Me</Link></li>
            </ul>
            {/* 发布帖子按钮 */}
            <div className="post" onClick={tryShowPostDialog}>
                <PlusIcon />
            </div>
        </footer>)}
    </>
};


export default Nav;