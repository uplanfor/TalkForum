import "../assets/normalize.css"
import "./styles/style_nav.css"
import logoLink from "/logo.ico"
import UserInfoSmall from "./UserInfoSmall";
import SearchDialog from "./SearchDialog";
import PostDialog from "./PostDialog";
import { useState } from "react";
import { Link } from "react-router-dom";
import { PlusIcon } from "@heroicons/react/24/solid";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";


const Nav = () => {
    const [searchDialogVisible, setSearchDialogVisible] = useState(false);
    const showSearchDialog = () => {
        if (window.innerWidth < 600) {
            setSearchDialogVisible(true);
        }
    }
    const [postDialogVisible, setPostDialogVisible] = useState(false);
    const showPostDialog = () => {
        setPostDialogVisible(true);
    }
    return <>
        {postDialogVisible && <PostDialog onClose={() => setPostDialogVisible(false)}></PostDialog>}
        {searchDialogVisible && <SearchDialog onClose={() => setSearchDialogVisible(false)}/>}
        <nav>
            <img src={logoLink} alt="Talk Forum" />
            <span className="title">Talk Forum</span>
            <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/club">Club</Link></li>
                <li><Link to="/mail">Mail</Link></li>
                <li><Link to="/me">Me</Link></li>
            </ul>
            <div className="search-container">
                <MagnifyingGlassIcon />
                <input type="text" placeholder="seek fun" onClick={showSearchDialog} />
            </div>

            <UserInfoSmall></UserInfoSmall>

        </nav>
        <footer>
            <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/club">Club</Link></li>
                <li>{/* 占位 */}</li>
                <li><Link to="/mail">Mail</Link></li>
                <li><Link to="/me">Me</Link></li>
            </ul>
            <div className="post" onClick={showPostDialog}>
                <PlusIcon />
            </div>
        </footer>
    </>
};


export default Nav;