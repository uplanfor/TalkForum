import { useState, useEffect } from "react";
import "./styles/style_admincomments.css";
import { commentAdminGetCommentsByPage } from "../api/ApiComments";
import type { Comment, CommentPageResponse } from "../api/ApiComments";
import type ApiResponse from "../api/ApiResponse";

const AdminComments = () => {
  // 状态管理
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const pageSize = 10;

  // 筛选条件
  const [status, setStatus] = useState<string>("");

  // 获取评论列表
  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await commentAdminGetCommentsByPage(
        currentPage,
        pageSize,
        status || null
      );
      
      if (response.success && response.data) {
        setComments(response.data.data || []);
        setTotalComments(response.data.total || 0);
        setTotalPages(Math.ceil((response.data.total || 0) / pageSize));
      } else {
        // 显示错误信息
        alert(`获取评论列表失败: ${response?.message || '未知错误'}`);
        setComments([]);
        setTotalComments(0);
        setTotalPages(1);
      }
    } catch (error: any) {
      console.error("获取评论列表失败:", error);
      alert(`获取评论列表失败: ${error?.message || '网络错误，请检查后端服务器是否启动'}`);
      setComments([]);
      setTotalComments(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchComments();
  }, [currentPage]);

  // 处理筛选
  const handleSearch = () => {
    setCurrentPage(1);
    // 使用setTimeout确保状态更新后再获取数据
    setTimeout(() => {
      fetchComments();
    }, 0);
  };

  // 处理重置筛选
  const handleReset = () => {
    setStatus("");
    setCurrentPage(1);
    // 使用setTimeout确保状态更新后再获取数据
    setTimeout(() => {
      fetchComments();
    }, 0);
  };

  // 格式化时间
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleString("zh-CN");
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING": return "待审核";
      case "PASS": return "已通过";
      case "REJECT": return "已拒绝";
      case "DELETE": return "已删除";
      default: return "未知";
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "#ffc107"; // 黄色
      case "PASS": return "#28a745"; // 绿色
      case "REJECT": return "#dc3545"; // 红色
      case "DELETE": return "#6c757d"; // 灰色
      default: return "#6c757d";
    }
  };

  return (
    <div className="admin-comments-container">
      <h1>评论管理</h1>
      
      {/* 筛选区域 */}
      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-item">
            <label>状态：</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">全部</option>
              <option value="PENDING">待审核</option>
              <option value="PASS">已通过</option>
              <option value="REJECT">已拒绝</option>
              <option value="DELETE">已删除</option>
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
      
      {/* 评论列表 */}
      <div className="comments-table-container">
        {loading ? (
          <div className="loading">加载中...</div>
        ) : comments.length === 0 ? (
          <div className="no-data">暂无评论数据</div>
        ) : (
          <table className="comments-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>帖子ID</th>
                <th>用户ID</th>
                <th>内容</th>
                <th>根评论ID</th>
                <th>父评论ID</th>
                <th>状态</th>
                <th>发布时间</th>
                <th>点赞数</th>
                <th>回复数</th>
              </tr>
            </thead>
            <tbody>
              {comments.map(comment => (
                <tr key={comment.id}>
                  <td>{comment.id}</td>
                  <td>{comment.postId}</td>
                  <td>{comment.userId}</td>
                  <td className="comment-content">{comment.content}</td>
                  <td>{comment.rootId || "-"}</td>
                  <td>{comment.parentId || "-"}</td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(comment.status) }}
                    >
                      {getStatusText(comment.status)}
                    </span>
                  </td>
                  <td>{formatTime(comment.createdAt)}</td>
                  <td>{comment.likeCount}</td>
                  <td>{comment.commentCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* 分页 */}
      {comments.length > 0 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || loading}
          >
            上一页
          </button>
          
          <span className="page-info">
            第 {currentPage} 页 / 共 {totalPages} 页（总计 {totalComments} 条）
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

export default AdminComments;
