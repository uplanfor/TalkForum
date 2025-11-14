import Nav from "../components/Nav";
import BackgroundImg from "../components/BackgroundImg";
import PostsContainer from "../components/PostsContainer";

const Home = () => (
    <>
        <Nav></Nav>
        <BackgroundImg src="https://img-s.msn.cn/tenant/amp/entityid/BB1msDBR?w=0&h=0&q=50&m=6&f=jpg&u=t" />
        {/* <BackgroundImg src="https://bing.img.run/1366x768.php" /> */}
        <PostsContainer/>
    </>
);


export default Home;