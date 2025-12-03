
import "./styles/style_spaceview.css"
import InfoBackground from "../components/InfoBackground";
import PostContainer, { PostContainerTargetType } from "../components/PostsContainer";
import { InfoBackgroundType } from "../constants/default";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeftIcon, EllipsisHorizontalIcon } from "@heroicons/react/20/solid";
import { useState, useEffect } from "react";
import NotFound from "./NotFound";
import { usersGetDetailedUserInfo } from "../api/ApiUsers";

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
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(true);

  // 验证type参数并转换为PostContainerTargetType
  const validType = type === "club" ? PostContainerTargetType.CLUB : PostContainerTargetType.USER;
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

  // 调用API判断目标是否存在
  useEffect(() => {
    const checkTargetExists = async () => {
      setLoading(true);
      try {
        if (validType === "club") {
          // 俱乐部接口未实现，暂时忽略验证
          setOk(false);
        } else {
          // 调用用户详情API，判断用户是否存在
          // 使用现有的usersGetDetailedUserInfo方法来验证用户是否存在
          const res = await usersGetDetailedUserInfo(spaceId);
          if (res.success) {
            setOk(true);
          } else {
            setOk(false);
          }
        }
      } catch (error) {
        console.error(`${validType} not found:`, error);
        setOk(false);
      } finally {
        setLoading(false);
      }
    };

    checkTargetExists();
  }, [validType, spaceId]);

  return (
    ok ? (
    <div className="space-view-cover">
      <div className="space-header">
        <ArrowLeftIcon onClick={handleClose} className="back-button" />
        <h2 className="space-title">
          {validType === "club" ? "Club Space" : "User Space"}
        </h2>
        <EllipsisHorizontalIcon/>
      </div>
      <InfoBackground 
        targetId={spaceId}
        targetType={validType}
      />
      <PostContainer 
        targetType={validType} 
        targetId={spaceId}
      />
    </div>
  ) : (
    <NotFound />
  ));
}

export default SpaceView;
