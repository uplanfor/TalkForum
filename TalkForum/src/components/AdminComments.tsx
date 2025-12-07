/**
 * 管理员评论管理组件
 * 用于管理员审核和管理评论
 */
import React, { useState, useEffect, useCallback } from 'react';
import ShowTable from "./ShowTable";
import Pagination from "./Pagination";
import Msg from "../utils/msg";
import {
  commentAdminGetCommentsByPage,
  commentAdminAuditComments,
  type Comment
} from "../api/ApiComments";
import { PostCommentStatusEnum, type CommentStatus } from "../constants/post_comment_status";
import "./styles/style_admin_common.css";
import { getSingleSimpleUserInfo, requestSimpleUserInfoCache } from '../utils/simpleUserInfoCache';
import dayjs from 'dayjs';
import { throttle } from '../utils/debounce&throttle';
import { HandThumbUpIcon, ChatBubbleBottomCenterIcon } from '@heroicons/react/24/outline';
import AuditCommentDialog from './AuditCommentDialog';

const AdminComments = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedComments, setSelectedComments] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showAuditDialog, setShowAuditDialog] = useState(false);
  
  // 查询条件状态
  const [status, setStatus] = useState('');

  // 加载评论列表
  const loadComments = async () => {
    setLoading(true);
    
    // 根据status是否为空字符串决定是否传递status参数
    await commentAdminGetCommentsByPage(page, pageSize, status || null).then(async res => {
      if (res.success) {
        const userIds = res.data.data.map(item => item.userId);
        await requestSimpleUserInfoCache(userIds);
        setComments(res.data.data);
        setTotal(res.data.total);
      } else {
        Msg.error(res.message);
      }
    }).catch(err => {
      Msg.error(err.message || "Failed to load comments");
      console.error("Error loading comments:", err);
    }).finally(() => {
      setLoading(false);
    });
  };

  // 处理单个选择
  const handleSelectComment = (commentId: number) => {
    setSelectedComments(prev => {
      if (prev.includes(commentId)) {
        // 如果当前已选中，则取消选中，并将全选状态设为false
        setSelectAll(false);
        return prev.filter(id => id !== commentId);
      } else {
        // 如果当前未选中，则添加到选中列表
        return [...prev, commentId];
      }
    });
  };

  // 处理全选
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedComments([]);
    } else {
      setSelectedComments(comments.map(item => item.id));
    }
    setSelectAll(!selectAll);
  };

  // 判断是否所有项目都被选中
  const isAllSelected = comments.length > 0 && selectedComments.length === comments.length;

  // 处理批量审核评论
  const handleBatchAuditComments = async () => {
    const menus = [PostCommentStatusEnum.PASS, PostCommentStatusEnum.REJECT, PostCommentStatusEnum.DELETE];
    const index = await Msg.menu(menus, `What do you want to deal with the selected ${selectedComments.length} comments?`);
    if (index === -1) {
      return;
    }
    // 处理审核
    const statusItem = menus[index];

    // 调用管理员审核评论的API
    await commentAdminAuditComments(selectedComments, statusItem).then(res => {
      if (res.success) {
        Msg.success(`${res.message}(${selectedComments.length} comments ${statusItem})`);

        // 如果是删除操作，从列表中移除评论
        if (statusItem === PostCommentStatusEnum.DELETE) {
          setComments(prevComments => 
            prevComments.filter(comment => !selectedComments.includes(comment.id))
          );
          setTotal(prevTotal => prevTotal - selectedComments.length);
        } else {
          // 如果是审核通过或拒绝，更新评论的状态
          setComments(prevComments =>
            prevComments.map(comment =>
              selectedComments.includes(comment.id)
                ? { ...comment, status: statusItem }
                : comment
            )
          );
        }
        
        // 清空选中列表
        setSelectedComments([]);
        setSelectAll(false);
      } else {
        throw new Error(res.message);
      }
    }).catch(err => {
      Msg.error(err.message || "Batch audit failed");
      console.error(err);
    });
  };
  const handleAuditComment = async (commentId: number) => {
    const menus = [PostCommentStatusEnum.PASS, PostCommentStatusEnum.REJECT, PostCommentStatusEnum.DELETE];
    const index = await Msg.menu(menus, `What do you want to deal with the comment(id: ${commentId})?`);
    if (index === -1) {
      return;
    }
    // 处理审核
    const statusItem = menus[index];

    // 调用管理员审核评论的API
    await commentAdminAuditComments([commentId], statusItem).then(res => {
      if (res.success) {
        Msg.success(`${res.message}(Comment ${statusItem})`);

        // 如果是删除操作，从列表中移除该评论
        if (statusItem === PostCommentStatusEnum.DELETE) {
          setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
          setTotal(prevTotal => prevTotal - 1);
        } else {
          // 如果是审核通过或拒绝，更新评论的状态
          setComments(prevComments =>
            prevComments.map(comment =>
              comment.id === commentId
                ? { ...comment, status: statusItem }
                : comment
            )
          );
        }
      } else {
        throw new Error(res.message);
      }
    }).catch(err => {
      Msg.error(err.message || "Audit failed");
      console.error(err);
    });
  };

  // 组件挂载时加载数据
  useEffect(() => {
    loadComments();
  }, [page, pageSize]);

  // 创建节流刷新函数，每5秒最多执行一次
  const throttledRefresh = useCallback(throttle(() => {
    Msg.success("Refreshing data...(5s)");
    loadComments();
  }, 5000), []) ;

  // 创建节流搜索函数，每5秒最多执行一次
  const throttledSearch = useCallback(throttle(() => {
    setPage(1); // 重置到第一页
    loadComments();
  }, 5000), []) ;

  return (
    <div className="admin-comments-container">
      <h1>Comments Management</h1>

      {/* 查询条件区域 */}
      <div className="search-filters">
        <div className="filter-row">
          <div className="filter-item">
            <label htmlFor="status">Status:</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value={PostCommentStatusEnum.PASS}>Pass</option>
              <option value={PostCommentStatusEnum.REJECT}>Reject</option>
              <option value={PostCommentStatusEnum.PENDING}>Pending</option>
              <option value={PostCommentStatusEnum.DELETE}>Delete</option>
            </select>
          </div>
          
          <div className="filter-actions">
            <button
              className="search-button"
              onClick={throttledSearch}
            >
              Search
            </button>
            <button
              className="reset-button"
              onClick={() => {
                setStatus('');
                setPage(1); // 重置到第一页
                loadComments();
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/*操作面板*/}
      <div className="action-buttons">
        <button
          className="btn btn-primary batch-audit-btn"
          onClick={handleBatchAuditComments}
          disabled={selectedComments.length === 0}
        >
          Batch Audit {selectedComments.length > 0 && `(${selectedComments.length} selected)`}
        </button>
        <button
          className="btn btn-primary audit-dialog-btn"
          onClick={() => setShowAuditDialog(true)}
        >
          Quick Audit Comments
        </button>
      </div>

      <div className="pagination-info">
        <span>Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} entries</span>
        <button
          className="refresh-button"
          onClick={throttledRefresh}
          title="Refresh data (throttled to once per 5 seconds)"
        >
          Refresh
        </button>
      </div>

      <ShowTable
        data={comments}
        renderItem={(item) => (
          <tr>
            <td>
              <input
                type="checkbox"
                checked={selectedComments.includes(item.id)}
                onChange={() => handleSelectComment(item.id)}
              />
            </td>
            <td>{item.id}</td>
            <td>{`${getSingleSimpleUserInfo(item.userId).name}(id: ${item.userId})`}</td>
            <td>{item.postId}</td>
            <td>
              <div className="comment-content">
                {item.content.length > 50 ? `${item.content.substring(0, 50)}...` : item.content}
              </div>
            </td>
            <td>
              <button
                className={`audit-button ${item.status.toLowerCase()}`}
                onClick={() => handleAuditComment(item.id)}
              >
                {item.status}
              </button>
            </td>
            <td>
              <span className="interaction-stats">
                <span className="stat-item">
                  <ChatBubbleBottomCenterIcon className="stat-icon" />
                  {item.commentCount}
                </span>
                <span className="stat-item">
                  <HandThumbUpIcon className="stat-icon" />
                  {item.likeCount}
                </span>
              </span>
            </td>
            <td>{dayjs(item.createdAt).format('YYYY-MM-DD HH:mm:ss')}</td>
            <td>
              <button 
                className="btn btn-secondary">More</button>
            </td>
          </tr>
        )}
        renderHeader={() => (<tr>
          <th>
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={handleSelectAll}
            />
          </th>
          <th>ID</th>
          <th>Author</th>
          <th>PostID</th>
          <th>Content</th>
          <th>Status</th>
          <th>Interactions</th>
          <th>Created At</th>
          <th>Details</th>
        </tr>)}
        emptyContent={<div>No comments found</div>}
      />

      <Pagination
        currentPage={page}
        totalPages={Math.ceil(total / pageSize)}
        loading={loading}
        onPageChange={setPage}
      />
      
      {/* 审核对话框 */}
      {showAuditDialog && (
        <AuditCommentDialog onClose={() => setShowAuditDialog(false)} />
      )}
    </div>
  )
}

export default AdminComments;
