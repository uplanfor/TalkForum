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

const AdminHome = lazy(() => import("../components/AdminHome"));
const AdminInsights = lazy(() => import("../components/AdminInsights"));
const AdminUsers = lazy(() => import("../components/AdminUsers"));
const AdminPosts = lazy(() => import("../components/AdminPosts"));
const AdminComments = lazy(() => import("../components/AdminComments"));
const AdminClubs = lazy(() => import("../components/AdminClubs"));
const AdminApplications = lazy(() => import("../components/AdminApplications"));
const AdminInviteCodes = lazy(() => import("../components/AdminInviteCodes"));


interface MenuItem {
    icon: any;
    label: string;
    component: ReactNode;
}

const Admin = () => {
    // 移动端默认隐藏菜单，桌面端不受影响
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

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
    const [curIndex, setCurIndex] = useState(0);

    // const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.user);
    const [loading, setLoading] = useState(user.role === "user" ? false : true);
    const [ok, setOk] = useState(false);

    useEffect(() => {
       if(!loading) {return;}
       authGetAdminInfo()
          .then(res => {
               if (res.success) {
                   setOk(true);
               }
           })
          .catch(err => {
           }).finally(() => {
               setLoading(false)
           });
    }, []);

    return loading ? <div></div> : ( ok ? 
        (<div className="admin-container">
            <h1 className="admin-header">
                <div className="admin-menu-toggle">
                    {isMenuOpen ? <XMarkIcon className="menu-toggle" onClick={toggleMenu} /> : <Bars3Icon className="menu-toggle" onClick={toggleMenu} />}
                </div>
                <img src={logoLink} alt="logo" className="admin-logo" />
                <div> TalkForum Administration</div>
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