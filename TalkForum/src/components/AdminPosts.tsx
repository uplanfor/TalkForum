import { useState, useEffect } from "react";
import "./styles/style_adminposts.css";
import { postsAdminGetPostList, postsAdminAuditPost, postsAdminSetPostAsEssence } from "../api/ApiPosts";
import type { PostType } from "../api/ApiPosts";
import type ApiResponse from "../api/ApiResponse";

interface Club {
  id: number;
  name: string;
}

interface PostListResponse {
  data: PostType[];
  total: number;
}

const AdminPosts = () => {
  // 状态管理
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const pageSize = 10;

  // 筛选条件
  const [keyword, setKeyword] = useState("");
  const [clubId, setClubId] = useState<number | "">("");
  const [userId, setUserId] = useState<number | "">("");
  const [isEssence, setIsEssence] = useState<number | "">("");
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loadingClubs, setLoadingClubs] = useState(false);

  // 获取帖子列表
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        pageSize,
      };
      
      if (keyword) params.keyword = keyword;
      if (clubId !== "") params.clubIds = [clubId];
      if (userId !== "") params.userIds = [userId];
      if (isEssence !== "") params.isEssence = isEssence;

      const response = await postsAdminGetPostList(params);
      if (response.success && response.data) {
        setPosts(response.data.data || []);
        setTotalPosts(response.data.total || 0);
        setTotalPages(Math.ceil((response.data.total || 0) / pageSize));
      } else {
        // 显示错误信息
        alert(`获取帖子列表失败: ${response?.message || '未知错误'}`);
        setPosts([]);
        setTotalPosts(0);
        setTotalPages(1);
      }
    } catch (error: any) {
      console.error("获取帖子列表失败:", error);
      alert(`获取帖子列表失败: ${error?.message || '网络错误，请检查后端服务器是否启动'}`);
      setPosts([]);
      setTotalPosts(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // 获取圈子列表（暂时留空，因为不知道如何调用接口）
  const fetchClubs = async () => {
    // TODO: 实现获取圈子列表的接口调用
    // 根据后端接口规范，应该调用 /api/clubs/ 接口
    // 暂时使用模拟数据
    setLoadingClubs(true);
    try {
      // 模拟数据
      const mockClubs: Club[] = [
        { id: 1, name: "技术交流" },
        { id: 2, name: "生活分享" },
        { id: 3, name: "学习讨论" },
      ];
      setClubs(mockClubs);
    } catch (error) {
      console.error("获取圈子列表失败:", error);
    } finally {
      setLoadingClubs(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchPosts();
    fetchClubs();
  }, [currentPage]);

  // 处理筛选
  const handleSearch = () => {
    setCurrentPage(1);
    // 使用setTimeout确保状态更新后再获取数据
    setTimeout(() => {
      fetchPosts();
    }, 0);
  };

  // 处理重置筛选
  const handleReset = () => {
    setKeyword("");
    setClubId("");
    setUserId("");
    setIsEssence("");
    setCurrentPage(1);
    // 使用setTimeout确保状态更新后再获取数据
    setTimeout(() => {
      fetchPosts();
    }, 0);
  };

  // 处理加精/取消加精
  const handleToggleEssence = async (postId: number, currentEssence: number) => {
    try {
      const newEssence = currentEssence === 1 ? 0 : 1;
      const response = await postsAdminSetPostAsEssence(postId, 1);
      if (response.success) {
        // 更新本地状态
        setPosts(posts.map(post => 
          post.id === postId ? { ...post, isEssence: newEssence } : post
        ));
        alert("操作成功");
      } else {
        alert(`操作失败: ${response.message}`);
      }
    } catch (error) {
      console.error("操作失败:", error);
      alert("操作失败，请检查网络连接");
    }
  };

  // 处理审核通过
  const handleApprove = async (postId: number) => {
    try {
      // 根据后端接口规范，status应该是字符串"PASS"
      const response = await postsAdminAuditPost(postId, 1); // 1 表示 PASS
      if (response.success) {
        // 更新本地状态
        setPosts(posts.map(post => 
          post.id === postId ? { ...post, status: 1 } : post
        ));
        alert("审核通过成功");
      } else {
        alert(`审核失败: ${response.message}`);
      }
    } catch (error) {
      console.error("审核失败:", error);
      alert("审核失败，请检查网络连接");
    }
  };

  // 处理删除帖子
  const handleDelete = async (postId: number) => {
    if (!window.confirm("确定要删除这个帖子吗？")) {
      return;
    }
    
    try {
      // 根据后端接口规范，应该调用 /api/posts/admin/{postId}/audit 接口，status=DELETE
      const response = await postsAdminAuditPost(postId, 3); // 3 表示 DELETE
      if (response.success) {
        // 从列表中移除
        setPosts(posts.filter(post => post.id !== postId));
        setTotalPosts(totalPosts - 1);
        alert("删除成功");
      } else {
        alert(`删除失败: ${response.message}`);
      }
    } catch (error) {
      console.error("删除失败:", error);
      alert("删除失败，请检查网络连接");
    }
  };

  // 格式化时间
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleString("zh-CN");
  };

  // 获取状态文本
  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return "待审核";
      case 1: return "已通过";
      case 2: return "已拒绝";
      case 3: return "已删除";
      default: return "未知";
    }
  };

  return (
    <div className="admin-posts-container">
      <h1>帖子管理</h1>
      
      {/* 筛选区域 */}
      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-item">
            <label>关键词：</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="输入关键词搜索"
            />
          </div>
          
          <div className="filter-item">
            <label>圈子：</label>
            <select
              value={clubId}
              onChange={(e) => setClubId(e.target.value === "" ? "" : Number(e.target.value))}
              disabled={loadingClubs}
            >
              <option value="">全部</option>
              {clubs.map(club => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-item">
            <label>用户ID：</label>
            <input
              type="number"
              value={userId}
              onChange={(e) => setUserId(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="输入用户ID"
              min="1"
            />
          </div>
          
          <div className="filter-item">
            <label>是否加精：</label>
            <select
              value={isEssence}
              onChange={(e) => setIsEssence(e.target.value === "" ? "" : Number(e.target.value))}
            >
              <option value="">全部</option>
              <option value="1">已加精</option>
              <option value="0">未加精</option>
            </select>
          </div>
        </div>
        
        <div className="filter-actions">
          <button className="btn-search" onClick={handleSearch} disabled={loading}>
            {loading ? "搜索中..." : "搜索"}
          </button>
          <button className="btn-reset" onClick={handleReset} disabled={loading}>
            重置
          </button>
        </div>
      </div>
      
      {/* 帖子列表 */}
      <div className="posts-table-container">
        {loading ? (
          <div className="loading">加载中...</div>
        ) : posts.length === 0 ? (
          <div className="no-data">暂无帖子数据</div>
        ) : (
          <table className="posts-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>标题</th>
                <th>用户</th>
                <th>发布时间</th>
                <th>状态</th>
                <th>是否加精</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id}>
                  <td>{post.id}</td>
                  <td className="post-title">{post.title}</td>
                  <td>用户{post.userId}</td>
                  <td>{formatTime(post.createdAt)}</td>
                  <td>{getStatusText(post.status)}</td>
                  <td>{post.isEssence === 1 ? "是" : "否"}</td>
                  <td className="actions">
                    <button
                      className={`btn-action ${post.isEssence === 1 ? "btn-remove-essence" : "btn-add-essence"}`}
                      onClick={() => handleToggleEssence(post.id, post.isEssence)}
                    >
                      {post.isEssence === 1 ? "取消加精" : "加精"}
                    </button>
                    <button
                      className="btn-action btn-approve"
                      onClick={() => handleApprove(post.id)}
                      disabled={post.status === 1}
                    >
                      {post.status === 1 ? "已通过" : "审核通过"}
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(post.id)}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* 分页 */}
      {posts.length > 0 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || loading}
          >
            上一页
          </button>
          
          <span className="page-info">
            第 {currentPage} 页 / 共 {totalPages} 页（总计 {totalPosts} 条）
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || loading}
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminPosts;
