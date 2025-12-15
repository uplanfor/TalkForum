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
  adminDeleteInviteCodes
} from "../api/ApiInvitecode";
import { requestSimpleUserInfoCache, getSingleSimpleUserInfo } from "../utils/simpleUserInfoCache";
import { throttle } from '../utils/debounce&throttle';
import InviteCodeDialog, { type InviteCodeDialogType } from "./InviteCodeDialog";
import { useTranslation } from "react-i18next";

/**
 * 管理员邀请码管理组件
 * 用于管理员生成、管理和分发邀请码
 */
const AdminInviteCodes = () => {
  const { t } = useTranslation();
  const [inviteCodes, setInviteCodes] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // 邀请码对话框状态
  const [showInviteCodeDialog, setShowInviteCodeDialog] = useState(false);
  const [dialogType, setDialogType] = useState<InviteCodeDialogType>("create");

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
    Msg.success(t('adminInviteCodes.refreshingMessage'));
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

  // 打开创建邀请码对话框
  const handleOpenCreateDialog = () => {
    setDialogType("create");
    setShowInviteCodeDialog(true);
  };

  // 打开更新邀请码对话框
  const handleOpenUpdateDialog = () => {
    if (selectedCodes.length === 0) {
      Msg.error(t('adminInviteCodes.selectCodesToUpdate'));
      return;
    }
    setDialogType("update");
    setShowInviteCodeDialog(true);
  };

  // 处理对话框成功回调
  const handleDialogSuccess = () => {
    setSelectedCodes([]);
    setSelectAll(false);
    loadInviteCodes(page, pageSize);
  };

  // 删除选中的邀请码
  const handleDeleteCodes = async () => {
    if (selectedCodes.length === 0) {
      Msg.error(t('adminInviteCodes.selectCodesToDelete'));
      return;
    }
    
    try {
      const res = await adminDeleteInviteCodes(selectedCodes);
      if (res.success) {
        Msg.success(t('adminInviteCodes.deleteSuccess', { count: selectedCodes.length }));
        setSelectedCodes([]);
        setSelectAll(false);
        loadInviteCodes(page, pageSize);
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      Msg.error(err.message || t('adminInviteCodes.deleteFailed'));
      console.error(err);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="admin-invite-codes-container">
      <h1>{t('adminInviteCodes.title')}</h1>

      {/* 操作按钮区域 */}
      <div className="action-buttons">
        <button
          className="btn btn-primary"
          onClick={handleOpenCreateDialog}
        >
          {t('adminInviteCodes.createNewButton')}
        </button>
        <button
          className="btn btn-primary"
          onClick={handleOpenUpdateDialog}
          disabled={selectedCodes.length === 0}
        >
          {t('adminInviteCodes.updateSelected')} ({selectedCodes.length})
        </button>
        <button
          className="btn btn-danger"
          onClick={handleDeleteCodes}
          disabled={selectedCodes.length === 0}
        >
          {t('adminInviteCodes.deleteSelected')} ({selectedCodes.length})
        </button>
      </div>

      <div className="pagination-info">
        <span>{t('adminInviteCodes.showingEntries', { 
          start: (page - 1) * pageSize + 1, 
          end: Math.min(page * pageSize, total), 
          total 
        })}</span>
        <button
          className="refresh-button"
          onClick={throttledRefresh}
          title={t('adminInviteCodes.refreshTooltip')}
        >
          {t('adminInviteCodes.refreshButton')}
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
          <th>{t('adminInviteCodes.codeHeader')}</th>
          <th>{t('adminInviteCodes.creatorHeader')}</th>
          <th>{t('adminInviteCodes.createdAtHeader')}</th>
          <th>{t('adminInviteCodes.usedMaxHeader')}</th>
          <th>{t('adminInviteCodes.expiredAtHeader')}</th>
        </tr>)}
        emptyContent={<div>{t('adminInviteCodes.noCodesFound')}</div>}
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        loading={loading}
        onPageChange={setPage}
      />

      {/* 邀请码操作对话框 */}
      <InviteCodeDialog
        type={dialogType}
        isOpen={showInviteCodeDialog}
        onClose={() => setShowInviteCodeDialog(false)}
        selectedCodes={selectedCodes}
        onSuccess={handleDialogSuccess}
      />
    </div>
  )
}

export default AdminInviteCodes;
