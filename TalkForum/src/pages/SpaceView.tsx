import InfoBackground from "../components/InfoBackground";
import PostContainer from "../components/PostsContainer";
import "./styles/style_spaceview.css"
import { InfoBackgroundType } from "../constants/default";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";

/**
 * SpaceView组件属性接口
 * 用于显示用户或俱乐部的空间页面
 */
interface SpaceViewProps {
  // 当前组件没有额外的props，主要依赖路由参数
}

const SpaceView = ({}: SpaceViewProps) => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();

  // 验证type参数
  const validType = type === "club" || type === "user" ? type : "user";
  const spaceId = id ? parseInt(id) : 0;

  const handleClose = () => {
    navigate(-1); // 返回上一页
  };

  // 根据type设置InfoBackground的类型
  const getInfoBackgroundType = () => {
    if (validType === "club") {
      return InfoBackgroundType.CLUB;
    } else {
      return InfoBackgroundType.SELF;
    }
  };

  return (
    <div className="space-view-cover">
      <div className="space-header">
        <ArrowLeftIcon onClick={handleClose} className="back-button" />
        <h2 className="space-title">
          {validType === "club" ? "Club Space" : "User Space"}
        </h2>
      </div>
      <InfoBackground 
        infoType={getInfoBackgroundType()} 
        targetId={spaceId}
        targetType={validType}
      />
      <PostContainer 
        targetType={validType} 
        targetId={spaceId}
      />
    </div>
  );
}

export default SpaceView;
