import Nav from "../components/Nav";
import InfoBackground from "../components/InfoBackground";
import PostContainer from "../components/PostsContainer";
import { InfoBackgroundType } from "../constants/default";

const Me = () => {
  return (
    <>
      <Nav />
      <InfoBackground infoType={InfoBackgroundType.SELF}></InfoBackground>
      <PostContainer />
    </>
  )
}

export default Me;