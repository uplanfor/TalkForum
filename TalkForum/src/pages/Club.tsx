import PostContainer from "../components/PostsContainer";
import Nav from "../components/Nav";
import "../assets/normalize.css"
import "./styles/style_club.css"

const Club = () => {
    return <>
        <Nav />
        <div className="functions">
            <div className="function-card">
                <h1>Apps</h1>
                <p>Explore Fun</p>
            </div>
            <div className="function-card">
                <h1>Clubs</h1>
                <p>Meet more like-minded people</p>
            </div>
        </div>
        <div className="followed-clubs">
            <h2>Followed Clubs</h2>
            <ul className="club-list">
                {/* <li className="club-info">
                    <img src="https://pic1.imgdb.cn/item/6905cbfa3203f7be00bf6e98.webp" alt="Not Found" />
                    <p>Chicken Club</p>
                </li> */}
                <p className="center-text">You haven't followed any club yet.</p>
            </ul>
        </div>
        <PostContainer />
    </>
}

export default Club;