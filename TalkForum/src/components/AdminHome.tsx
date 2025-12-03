/**
 * 管理员首页组件
 * 显示管理员仪表盘，包括欢迎信息和统计数据
 */
import "./styles/style_adminhome.css"

import { useSelector } from "react-redux";
import { type RootState } from "../store";

/**
 * 管理员首页组件
 * 显示管理员仪表盘，包括欢迎信息和统计数据
 */
const AdminHome = () => {
  // 从Redux store获取当前用户信息
  const user = useSelector((state: RootState) => state.user);
  
  // 判断当前时间，显示相应的问候语
  const time = new Date().getHours();
  let greeting = "";
  if (time >= 6 && time < 12) {
    greeting = "Good Morning";
  } else if (time >= 12 && time < 18) {
    greeting = "Good Afternoon";
  } else {
    greeting = "Good Evening";
  }

  return (
    <div className="admin-home">
      {/* 欢迎信息区域 */}
      <div className="admin-home-greeting">
        {/* 动态问候语 */}
        <h1>{greeting}, <span style={{color: "var(--primary)"}}>{user.name}</span> !</h1>
        {/* 欢迎描述 */}
        <p>Welcome to the TalkForum Admin Dashboard!</p>
      </div>
      
      {/* 统计数据区域 */}
      <div className="admin-home-status">
        {/* 用户总数 */}
        <div className="admin-home-status-item">
          <h2>Total Users</h2>
          <p>1million</p>
        </div>
        
        {/* 帖子总数 */}
        <div className="admin-home-status-item">
          <h2>Total Posts</h2>
          <p>10,000</p>
        </div>
        
        {/* 举报总数 */}
        <div className="admin-home-status-item">
          <h2>Total Reports</h2>
          <p>99</p>
        </div>
        
        {/* 评论总数 */}
        <div className="admin-home-status-item">
          <h2>Total Comments</h2>
          <p>25536</p>
        </div>
        
        {/* 未处理评论数 */}
        <div className="admin-home-status-item">
          <h2>Comments Not Handled</h2>
          <p>10000</p>
        </div>
        
        {/* 未处理举报数 */}
        <div className="admin-home-status-item">
          <h2>Report Not Handled</h2>
          <p>50</p>
        </div>
      </div>
    </div>
  )
}

export default AdminHome;
