import Nav from "../components/Nav";
import BackgroundImg from "../components/BackgroundImg";
import PostsContainer from "../components/PostsContainer";
import { DefaultBackgroundUrl } from "../constants/default";

const Home = () => (
    <>
        <Nav></Nav>
        <BackgroundImg src={DefaultBackgroundUrl} />
        {/* <BackgroundImg src="https://bing.img.run/1366x768.php" /> */}
        <PostsContainer/>
    </>
);


export default Home;