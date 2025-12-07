/**
 * 管理员邀请码管理组件
 * 用于管理员生成、管理和分发邀请码
 */
import "./styles/style_admin_common.css"
import ShowTable from "./ShowTable";
import Pagination from "./Pagination";
import Msg from "../utils/msg";
import dayjs from "dayjs";
import { useState, useEffect, useCallback } from "react";
import {
  adminGetInvitecodeByPage,
  adminUpdateInviteCodes,
  adminDeleteInviteCodes,
  adminGenerateInviteCodes,
  type InvitecodePage
} from "../api/ApiInvitecode";
import { requestSimpleUserInfoCache, getSingleSimpleUserInfo } from "../utils/simpleUserInfoCache";
import { throttle } from '../utils/debounce&throttle';

/**
 * 管理员邀请码管理组件
 * 用于管理员生成、管理和分发邀请码
 */
const AdminInviteCodes = () => {
  const [inviteCodes, setInviteCodes] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [updateMaxCount, setUpdateMaxCount] = useState("");
  const [updateExpiredDays, setUpdateExpiredDays] = useState("");
  const [selectAll, setSelectAll] = useState(false);

  // 创建邀请码相关状态
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createMaxCount, setCreateMaxCount] = useState("");
  const [createExpiredDays, setCreateExpiredDays] = useState("");
  const [createCount, setCreateCount] = useState("");

  const loadInviteCodes = async (pageNum: number, size: number) => {
    setLoading(true);
    await adminGetInvitecodeByPage(pageNum, size).then(async res=>{
      if (res.success) {
        const data = res.data.data;
        await requestSimpleUserInfoCache(data.map((item) => item.creatorId));
        setInviteCodes(data);
        setTotal(res.data.total);
      } else {
        throw new Error(res.message);
      }
    }).catch(err => {
      Msg.error(err.message);
      console.error(err);
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    loadInviteCodes(page, pageSize);
  }, [page, pageSize]);

  // 创建节流刷新函数，每5秒最多执行一次
  const throttledRefresh = useCallback(throttle(() => {
    Msg.success("Refreshing data...(5s)");
    loadInviteCodes(page, pageSize);
  }, 5000), [page, pageSize]);

  // 处理单个选择
  const handleSelectCode = (code: string) => {
    setSelectedCodes(prev => {
      if (prev.includes(code)) {
        // 如果当前已选中，则取消选中，并将全选状态设为false
        setSelectAll(false);
        return prev.filter(c => c !== code);
      } else {
        // 如果当前未选中，则添加到选中列表
        return [...prev, code];
      }
    });
  };

  // 处理全选
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCodes([]);
    } else {
      setSelectedCodes(inviteCodes.map(item => item.code));
    }
    setSelectAll(!selectAll);
  };

  // 判断是否所有项目都被选中
  const isAllSelected = inviteCodes.length > 0 && selectedCodes.length === inviteCodes.length;

  // 批量更新邀请码
  const handleUpdateCodes = async () => {
    if (selectedCodes.length === 0) {
      Msg.error("Please select invite codes to update");
      return;
    }

    if (!updateMaxCount || !updateExpiredDays) {
      Msg.error("Both max usage count and expiration days are required");
      return;
    }

    const maxCount = parseInt(updateMaxCount);
    const expiredDays = parseInt(updateExpiredDays);

    if (isNaN(maxCount) || maxCount < 1) {
      Msg.error("Max usage count must be a positive number");
      return;
    }

    if (isNaN(expiredDays) || expiredDays < 1) {
      Msg.error("Expiration days must be a positive number");
      return;
    }

    await adminUpdateInviteCodes(selectedCodes, maxCount, expiredDays).then(async res => {
      if (res.success) {
        Msg.success(res.message || "Invite codes updated successfully");
        setShowUpdateDialog(false);
        setUpdateMaxCount("");
        setUpdateExpiredDays("");
        setSelectedCodes([]);
        setSelectAll(false);
        await loadInviteCodes(page, pageSize);
      } else {
        throw new Error(res.message);
      }
    }).catch(err => {
      Msg.error(err || "Update failed");
      console.error(err);
    })
  };

  // 批量删除邀请码
  const handleDeleteCodes = async () => {
    if (selectedCodes.length === 0) {
      Msg.error("Please select invite codes to delete");
      return;
    }

    const confirmed = await Msg.confirm(`Are you sure you want to delete the selected ${selectedCodes.length} invite codes?`);
    if (!confirmed) {
      return;
    }

    await adminDeleteInviteCodes(selectedCodes).then(async res => {
      if (res.success) {
        Msg.success(res.message || "Invite codes deleted successfully");
        setSelectedCodes([]);
        setSelectAll(false);
        await loadInviteCodes(page, pageSize);
      } else {
        throw new Error(res.message);
      }
    }).catch(err => {
      Msg.error(err || "Delete failed");
      console.error(err);
    })
  };

  // 批量创建邀请码
  const handleCreateCodes = async () => {
    if (!createMaxCount || !createExpiredDays || !createCount) {
      Msg.error("All fields are required");
      return;
    }

    const maxCount = parseInt(createMaxCount);
    const expiredDays = parseInt(createExpiredDays);
    const generateCount = parseInt(createCount);

    if (isNaN(maxCount) || maxCount < 1) {
      Msg.error("Max usage count must be a positive number");
      return;
    }

    if (isNaN(expiredDays) || expiredDays < 1) {
      Msg.error("Expiration days must be a positive number");
      return;
    }

    if (isNaN(generateCount) || generateCount < 1) {
      Msg.error("Generate count must be a positive number");
      return;
    }

    await adminGenerateInviteCodes(maxCount, expiredDays, generateCount).then(async res => {
      if (res.success) {
        Msg.success(res.message || `${generateCount} invite codes created successfully`);
        setShowCreateDialog(false);
        setCreateMaxCount("");
        setCreateExpiredDays("");
        setCreateCount("");
        await loadInviteCodes(page, pageSize);
      } else {
        throw new Error(res.message);
      }
    }).catch(err => {
      Msg.error(err || "Create failed");
      console.error(err);
    });
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="admin-invite-codes-container">
      <h1>Invite Codes</h1>

      {/* 操作按钮区域 */}
      <div className="action-buttons">
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateDialog(true)}
        >
          Create New Invite Codes
        </button>
        <button
          className="btn btn-primary"
          onClick={() => setShowUpdateDialog(true)}
          disabled={selectedCodes.length === 0}
        >
          Update Selected ({selectedCodes.length})
        </button>
        <button
          className="btn btn-danger"
          onClick={handleDeleteCodes}
          disabled={selectedCodes.length === 0}
        >
          Delete Selected ({selectedCodes.length})
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
        data={inviteCodes}
        renderItem={(item) => (
          <tr>
            <td>
              <input
                type="checkbox"
                checked={selectedCodes.includes(item.code)}
                onChange={() => handleSelectCode(item.code)}
              />
            </td>
            <td>{item.code}</td>
            <td>{getSingleSimpleUserInfo(item.creatorId).name}({item.creatorId})</td>
            <td>{dayjs(item.createdAt).format("HH:mm MMM DD, YYYY")}</td>
            <td>{item.usedCount}/{item.maxCount}</td>
            <td>{dayjs(item.expiredAt).format("HH:mm MMM DD, YYYY")}</td>
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
          <th>Code</th>
          <th>Creator</th>
          <th>Created At</th>
          <th>Used/Max Use</th>
          <th>Expired At</th>
        </tr>)}
        emptyContent={<div>No invite codes found</div>}
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        loading={loading}
        onPageChange={setPage}
      />

      {/* 更新对话框 */}
      {showUpdateDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h2>Update Invite Codes (All fields required)</h2>
            <div className="form-group">
              <label>Max Usage Count *</label>
              <input
                type="number"
                value={updateMaxCount}
                onChange={(e) => setUpdateMaxCount(e.target.value)}
                min="1"
                placeholder="Enter max usage count"
              />
            </div>
            <div className="form-group">
              <label>Expiration Days *</label>
              <input
                type="number"
                value={updateExpiredDays}
                onChange={(e) => setUpdateExpiredDays(e.target.value)}
                min="1"
                placeholder="Enter expiration days"
              />
            </div>
            <div className="dialog-buttons">
              <button className="btn btn-secondary" onClick={() => {
                setShowUpdateDialog(false);
                setUpdateMaxCount("");
                setUpdateExpiredDays("");
              }}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleUpdateCodes}>
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 创建对话框 */}
      {showCreateDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h2>Create New Invite Codes (All fields required)</h2>
            <div className="form-group">
              <label>Max Usage Count *</label>
              <input
                type="number"
                value={createMaxCount}
                onChange={(e) => setCreateMaxCount(e.target.value)}
                min="1"
                placeholder="Enter max usage count"
              />
            </div>
            <div className="form-group">
              <label>Expiration Days *</label>
              <input
                type="number"
                value={createExpiredDays}
                onChange={(e) => setCreateExpiredDays(e.target.value)}
                min="1"
                placeholder="Enter expiration days"
              />
            </div>
            <div className="form-group">
              <label>Generate Count *</label>
              <input
                type="number"
                value={createCount}
                onChange={(e) => setCreateCount(e.target.value)}
                min="1"
                placeholder="Enter number of codes to generate"
              />
            </div>
            <div className="dialog-buttons">
              <button className="btn btn-secondary" onClick={() => {
                setShowCreateDialog(false);
                setCreateMaxCount("");
                setCreateExpiredDays("");
                setCreateCount("");
              }}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleCreateCodes}>
                Create Invite Codes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminInviteCodes;
