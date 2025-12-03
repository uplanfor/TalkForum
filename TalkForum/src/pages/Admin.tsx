/**
 * 管理员页面组件
 * 管理员后台管理系统的主页面，包含：
 * - 侧边导航菜单
 * - 管理员权限验证
 * - 动态加载各管理模块
 * - 响应式设计，支持移动端和桌面端
 * 
 * 该页面使用React.lazy进行组件懒加载，提高性能
 */
import { useEffect, useState, lazy, type ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type RootState, type AppDispatch } from "../store";
import {
    Bars3Icon,
    XMarkIcon,
    HomeIcon,
    ChartBarIcon,
    UsersIcon,
    DocumentTextIcon,
    ChatBubbleLeftRightIcon,
    UserGroupIcon,
    ClipboardDocumentListIcon,
    KeyIcon
} from "@heroicons/react/24/outline";
import { authGetAdminInfo } from "../api/ApiAuth";
import logoLink from "/logo.ico"
import "./styles/style_admin.css";
import NotFound from "./NotFound";
import UserInfoSmall from "../components/UserInfoSmall";

// 懒加载各管理组件，提高初始加载性能
const AdminHome = lazy(() => import("../components/AdminHome"));
const AdminInsights = lazy(() => import("../components/AdminInsights"));
const AdminUsers = lazy(() => import("../components/AdminUsers"));
const AdminPosts = lazy(() => import("../components/AdminPosts"));
const AdminComments = lazy(() => import("../components/AdminComments"));
const AdminClubs = lazy(() => import("../components/AdminClubs"));
const AdminApplications = lazy(() => import("../components/AdminApplications"));
const AdminInviteCodes = lazy(() => import("../components/AdminInviteCodes"));

/**
 * 菜单项接口
 * 定义侧边导航菜单的每一项结构
 */
interface MenuItem {
    icon: any;           // 菜单项图标
    label: string;       // 菜单项名称
    component: ReactNode;// 菜单项对应的组件
}

/**
 * 管理员页面组件
 * 管理员后台管理系统的主页面
 */
const Admin = () => {
    // 移动端菜单展开/折叠状态
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    /**
     * 切换移动端菜单的展开/折叠状态
     */
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // 侧边导航菜单配置
    const menuItems : MenuItem[] = [
        { icon: HomeIcon, label: "Home", component: <AdminHome/> },
        { icon: ChartBarIcon, label: "Insights", component: <AdminInsights/> },
        { icon: UsersIcon, label: "Users", component: <AdminUsers/> },
        { icon: DocumentTextIcon, label: "Posts", component: <AdminPosts/> },
        { icon: ChatBubbleLeftRightIcon, label: "Comments", component: <AdminComments/> },
        { icon: UserGroupIcon, label: "Clubs", component: <AdminClubs/> },
        { icon: ClipboardDocumentListIcon, label: "Applications", component: <AdminApplications/> },
        { icon: KeyIcon, label: "Invite Codes", component: <AdminInviteCodes/> }
    ];
    
    // 当前选中的菜单项索引
    const [curIndex, setCurIndex] = useState(0);

    // 从Redux获取用户信息
    const user = useSelector((state: RootState) => state.user);
    // 加载状态，用于显示加载动画
    const [loading, setLoading] = useState(user.role === "user" ? false : true);
    // 管理员权限验证结果
    const [ok, setOk] = useState(false);

    /**
     * 组件挂载时验证管理员权限
     * 调用API获取管理员信息，验证用户是否具有管理员权限
     */
    useEffect(() => {
       if(!loading) {return;}
       authGetAdminInfo()
          .then(res => {
               if (res.success) {
                   setOk(true); // 验证成功
               }
           })
          .catch(err => {
               // 验证失败，不处理，保持ok为false
           }).finally(() => {
               setLoading(false); // 无论成功失败，结束加载状态
           });
    }, []);

    return loading ? <div></div> : ( ok && user.isLoggedIn ? 
        (<div className="admin-container">
            <h1 className="admin-header">
                <div className="admin-menu-toggle">
                    {isMenuOpen ? <XMarkIcon className="menu-toggle" onClick={toggleMenu} /> : <Bars3Icon className="menu-toggle" onClick={toggleMenu} />}
                </div>
                <img src={logoLink} alt="logo" className="admin-logo" />
                <div> TalkForum Administration </div>
                <UserInfoSmall style={{marginLeft: "auto"}} />
            </h1>
            <div className="admin-view">
                <div className={`admin-menu-cover ${isMenuOpen ? "menu-open" : "menu-close"}`}>
                    <ul className="admin-menu">
                        {menuItems.map((item, index) => (
                            <li key={index} onClick={()=>{setCurIndex(index); toggleMenu()}}>
                                <item.icon className="menu-icon" />
                                <span className="menu-label">{item.label}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="admin-content">
                    {menuItems[curIndex].component}
                </div>
            </div>
        </div>) : <NotFound />

    );
};

export default Admin;