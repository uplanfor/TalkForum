import "../assets/normalise.css"
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
    return <>
        {/* <PostDialog></PostDialog> */}
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
                <input type="text" placeholder="search something..." onClick={showSearchDialog} />
            </div>

            <UserInfoSmall></UserInfoSmall>

        </nav>
        {searchDialogVisible && <SearchDialog onClose={() => setSearchDialogVisible(false)}/>}
        <footer>
            <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/club">Club</Link></li>
                <li>{/* 占位 */}</li>
                <li><Link to="/mail">Mail</Link></li>
                <li><Link to="/me">Me</Link></li>
            </ul>
            <div className="post">
                <PlusIcon />
            </div>
        </footer>
    </>
};


export default Nav;