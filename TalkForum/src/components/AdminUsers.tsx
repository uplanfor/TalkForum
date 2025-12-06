/**
 * 管理员用户管理组件
 * 用于管理员查看和管理用户信息，包括设置用户角色、状态和重置密码等功能
 */
import React, { useState, useEffect } from 'react';
import { usersAdminGetUsersByPage, usersAdminSetUserRole, usersAdminSetUserStatus, usersAdminResetUserPassword, type UserVO } from '../api/ApiUsers';
import { getSingleSimpleUserInfo, type SimpleUserInfo } from '../utils/simpleUserInfoCache';
import { UserRoleEnum, UsersStatusEnum, type UserRole, type UserStatus } from '../constants/user_constant';
import ShowTable from './ShowTable';
import Pagination from './Pagination';
import Msg from '../utils/msg';
import dayjs from 'dayjs';

// 定义用户角色选项
const userRoles: UserRole[] = Object.values(UserRoleEnum);

// 定义用户状态选项
const userStatuses: UserStatus[] = Object.values(UsersStatusEnum);

const AdminUser: React.FC = () => {
  // 状态定义
  const [users, setUsers] = useState<UserVO[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // 加载用户列表
  const loadUsers = async (currentPage: number, currentPageSize: number) => {
    setLoading(true);

    await usersAdminGetUsersByPage(currentPage, currentPageSize)
      .then(res => {
        if (res.success && res.data) {
          setUsers(res.data.data);
          setTotal(res.data.total);
        } else {
          throw new Error(res.message || 'Failed to load users');
        }
      })
      .catch(err => {
        Msg.error(err || 'Failed to load users');
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };



  // 初始加载
  useEffect(() => {
    loadUsers(page, pageSize);
  }, [page, pageSize]);

  // 节流刷新函数（5秒内只能刷新一次）
  const throttledRefresh = (() => {
    let lastRefreshTime = 0;
    return () => {
      const now = Date.now();
      if (now - lastRefreshTime >= 5000) {
        loadUsers(page, pageSize);
        lastRefreshTime = now;
        Msg.success('Data refreshed');
      } else {
        const remainingTime = Math.ceil((5000 - (now - lastRefreshTime)) / 1000);
        Msg.success(`Please wait ${remainingTime} seconds before refreshing again`);
      }
    };
  })();

  // 处理单个用户选择
  const handleSelectUser = (userId: number) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  // 处理全选
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
    setSelectAll(!selectAll);
  };

  // 当用户列表变化时，更新全选状态
  useEffect(() => {
    if (users.length > 0 && selectedUsers.length === users.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedUsers, users]);

  // 重置用户密码
  const handleResetPassword = async (userId: number, userName: string) => {
    const confirmed = await Msg.confirm(`Are you sure you want to reset password for user "${userName}"?`);
    if (confirmed) {
      await usersAdminResetUserPassword(userId).then(res => {
        if (res.success) {
          Msg.success(res.message || `Password reset successfully for user "${userName}"`);
        } else {
          throw new Error(res.message);
        }
      }).catch(err => {
        Msg.error(err || 'Failed to reset password');
        console.error(err);
      });
    }
  };

  // 设置用户状态
  const handleSetStatus = async (userId: number, userName: string) => {

  };

  // 设置用户角色
  const handleSetRole = async (userId: number, userName: string) => {

  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="admin-users-container">
      <h1>Users Management</h1>

      {/* 操作按钮区域 */}
      {/* <div className="action-buttons">
        <button
          className="btn btn-primary"
          disabled={selectedUsers.length === 0}
        >
          Set Role ({selectedUsers.length})
        </button>
        <button
          className="btn btn-primary"
          disabled={selectedUsers.length === 0}
        >
          Set Status ({selectedUsers.length})
        </button>
      </div> */}

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
        data={users}
        renderItem={(item) => (
          <tr>
            <td>
              <input
                type="checkbox"
                checked={selectedUsers.includes(item.id)}
                onChange={() => handleSelectUser(item.id)}
              />
            </td>
            <td>{item.id}</td>
            <td>{item.name}</td>
            <td>
              <button
                className="btn btn-secondary"
                onClick={() => handleSetStatus(item.id, item.name)}
              >
                {item.status}
              </button>
            </td>
            <td>
              <button
                className="btn btn-secondary"
                onClick={() => handleSetRole(item.id, item.name)}
              >
                {item.role}  </button></td>
            <td>
              <button
                className="btn btn-secondary"
                onClick={() => handleResetPassword(item.id, item.name)}
              >
                Reset
              </button>
            </td>
            <td>{item.email}</td>
            <td>{item.intro}</td>
            <td>{item.fansCount}</td>
            <td>{item.followingCount}</td>
            <td>{dayjs(item.createdAt).format("HH:mm MMM DD, YYYY")}</td>
            <td>{dayjs(item.lastLoginAt).format("HH:mm MMM DD, YYYY")}</td>
          </tr>
        )}
        renderHeader={() => (<tr>
          <th>
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
            />
          </th>
          <th>ID</th>
          <th>Name</th>
          <th>Status</th>
          <th>Role</th>
          <th>Password</th>
          <th>Email</th>
          <th>Intro</th>
          <th>Fans</th>
          <th>Following</th>
          <th>Created At</th>
          <th>Last Login</th>
        </tr>)}
        emptyContent={<div>No users found</div>}
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        loading={loading}
        onPageChange={setPage}
      />
    </div>
  )
}

export default AdminUser;