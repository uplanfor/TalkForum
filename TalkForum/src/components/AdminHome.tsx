import "./styles/style_adminhome.css"

import { useDispatch, useSelector } from "react-redux";
import { type RootState, type AppDispatch } from "../store";
const AdminHome = () => {
  
  const user = useSelector((state: RootState) => state.user);
  // 判断现在是早上，下午，还是晚上，显示问候语
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
      <div className="admin-home-greeting">
        
      <h1>{greeting}, <span style={{color: "var(--primary)"}}>{user.name}</span> !</h1>
      <p>Welcome to the TalkForum Admin Dashboard!</p>
      </div>
      <div className="admin-home-status">
        <div className="admin-home-status-item">
          <h2>Total Users</h2>
          <p>1million</p>
        </div>
        <div className="admin-home-status-item">
          <h2>Total Posts</h2>
          <p>10,000</p>
        </div>
        <div className="admin-home-status-item">
          <h2>Total Reports</h2>
          <p>99</p>
        </div>
        <div className="admin-home-status-item">
          <h2>Total Comments</h2>
          <p>25536</p>
        </div>
        <div className="admin-home-status-item">
          <h2>Comments Not Handled</h2>
          <p>10000</p>
        </div>
        <div className="admin-home-status-item">
          <h2>Report Not Handled</h2>
          <p>50</p>
        </div>
      </div>
    </div>
  )
}

export default AdminHome;
