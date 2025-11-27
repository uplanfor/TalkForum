import Nav from "../components/Nav";
import BackgroundImg from "../components/BackgroundImg";
import PostsContainer from "../components/PostsContainer";
import { DefaultBackgroundUrl } from "../constants/default";
import KeepAlive from "react-activation";

const Home = () => (
    <>
        <Nav></Nav>
        <BackgroundImg src={DefaultBackgroundUrl} />
        {/* <BackgroundImg src="https://bing.img.run/1366x768.php" /> */}

        <PostsContainer tabs={["Latest", "Essence"]} />
    </>
);


export default Home;