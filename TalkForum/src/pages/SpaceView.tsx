
import "./styles/style_spaceview.css"
import InfoBackground from "../components/InfoBackground";
import PostContainer, { PostContainerTargetType } from "../components/PostsContainer";
import { InfoBackgroundType } from "../constants/default";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeftIcon, EllipsisHorizontalIcon } from "@heroicons/react/20/solid";
import { useState, useEffect } from "react";
import NotFound from "./NotFound";
import { usersGetDetailedUserInfo } from "../api/ApiUsers";
import Msg from "../utils/msg";
import ReportDialog from "../components/ReportDialog";
import { copyToClipboard } from "../utils/clipboard";
import { ReportTargetConstant } from "../constants/report_constant";
import { createPortal } from "react-dom";
import { getSingleSimpleUserInfo } from "../utils/simpleUserInfoCache";

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
  const [showReportDialog, setShowReportDialog] = useState(false);

  // 验证type参数并转换为PostContainerTargetType
  const validType = type === "club" ? PostContainerTargetType.CLUB : PostContainerTargetType.USER;
  const spaceId = id ? parseInt(id) : 0;

  const handleClose = () => {
    navigate(-1); // 返回上一页
  };

  // 根据type设置InfoBackground的类型
  const getInfoBackgroundType = () => {
    if (validType === PostContainerTargetType.CLUB) {
      return InfoBackgroundType.CLUB;
    } else if (validType === PostContainerTargetType.USER) {
      return InfoBackgroundType.USER;
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
        <EllipsisHorizontalIcon onClick={async (e)=>{
          const menus = [
            "Share Space", "Report"
          ];
          const res = await Msg.menu(menus);
          if (res != -1) {
            if (res == 0) {
              copyToClipboard(String(window.location));
              Msg.success("Already copy the link at the copyboard!Send to friends to recommand it!")
            } else if (res == 1) {
              setShowReportDialog(true);
            }
          }
        }}/>
      </div>
      <InfoBackground 
        targetId={spaceId}
        targetType={getInfoBackgroundType()}
      />
      <PostContainer 
        targetType={validType} 
        targetId={spaceId}
      />

      {showReportDialog && createPortal(
        validType == PostContainerTargetType.USER ?
        <ReportDialog 
          onClose={() => setShowReportDialog(false)} 
          reportId={spaceId} reportTargetType={ReportTargetConstant.USER} 
          notification={`Report the user ${getSingleSimpleUserInfo(spaceId).name} (${spaceId})`}/> :
        <ReportDialog 
          onClose={() => setShowReportDialog(false)} 
          reportId={spaceId} reportTargetType={ReportTargetConstant.CLUB} 
          notification={`Report the club ${spaceId}`}/>,
        document.body)

      }
    </div>
  ) : (
    <NotFound />
  ));
}

export default SpaceView;
