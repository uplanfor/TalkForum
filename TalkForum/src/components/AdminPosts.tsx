/**
 * 管理员帖子管理组件
 * 用于管理员审核、管理和设置帖子精华
 */
import React, { useState, useEffect, useCallback } from 'react';
import ShowTable from "./ShowTable";
import Pagination from "./Pagination";
import Msg from "../utils/msg";
import {
  postsAdminGetPostList,
  postsAdminAuditPost,
  postsAdminSetPostAsEssence,
  type PostType
} from "../api/ApiPosts";
import { PostCommentStatusEnum, type PostStatus } from "../constants/post_comment_status";
import "./styles/style_admin_common.css";
import { getSingleSimpleUserInfo, requestSimpleUserInfoCache } from '../utils/simpleUserInfoCache';
import dayjs from 'dayjs';
import { throttle } from '../utils/debounce&throttle';
import { EyeIcon, HandThumbUpIcon, ChatBubbleBottomCenterIcon } from '@heroicons/react/24/outline';
import AuditPostDialog from "./AuditPostDialog";
import { useTranslation } from 'react-i18next';

const AdminPosts = () => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showAuditDialog, setShowAuditDialog] = useState(false);
  
  // 查询条件状态
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [clubIds, setClubIds] = useState('');
  const [userIds, setUserIds] = useState('');
  const [isEssence, setIsEssence] = useState<number | undefined>(undefined);

  // 加载帖子列表
  const loadPosts = async () => {
    setLoading(true);
    const params: any = {
      page,
      pageSize,
    };
    
    // 添加查询条件
    if (keyword) params.keyword = keyword;
    if (status) params.status = status;
    if (clubIds) {
      // 将逗号分隔的字符串转换为数字数组
      const clubIdArray = clubIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      if (clubIdArray.length > 0) params.clubIds = clubIdArray;
    }
    if (userIds) {
      // 将逗号分隔的字符串转换为数字数组
      const userIdArray = userIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      if (userIdArray.length > 0) params.userIds = userIdArray;
    }
    if (isEssence !== undefined) params.isEssence = isEssence;

    await postsAdminGetPostList(params).then(async res => {
      if (res.success) {
        const userIds = res.data.data.map(item => item.userId);
        await requestSimpleUserInfoCache(userIds);
        setPosts(res.data.data);
        setTotal(res.data.total);
      } else {
        Msg.error(res.message);
      }
    }).catch(err => {
      Msg.error(err.message || "Failed to load posts");
      console.error("Error loading posts:", err);
    }).finally(() => {
      setLoading(false);
    });
  };

  // 处理单个选择
  const handleSelectPost = (postId: number) => {
    setSelectedPosts(prev => {
      if (prev.includes(postId)) {
        // 如果当前已选中，则取消选中，并将全选状态设为false
        setSelectAll(false);
        return prev.filter(id => id !== postId);
      } else {
        // 如果当前未选中，则添加到选中列表
        return [...prev, postId];
      }
    });
  };

  // 处理全选
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(posts.map(item => item.id));
    }
    setSelectAll(!selectAll);
  };

  // 判断是否所有项目都被选中
  const isAllSelected = posts.length > 0 && selectedPosts.length === posts.length;

  // 处理帖子审核
  const handleAuditPost = async (postId: number) => {
    const menus = [PostCommentStatusEnum.PASS, PostCommentStatusEnum.REJECT, PostCommentStatusEnum.DELETE];
    const index = await Msg.menu(menus, t('adminPosts.auditMenu', { postId }));
    if (index === -1) {
      return;
    }
    // 处理审核
    const statusItem = menus[index];

    await postsAdminAuditPost(postId, statusItem).then(res => {
      if (res.success) {
        Msg.success(`${res.message}(Post ${statusItem})`);

        // 如果是删除操作，从列表中移除该帖子
        if (statusItem === PostCommentStatusEnum.DELETE) {
          setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
          setTotal(prevTotal => prevTotal - 1);
        } else {
          // 如果是审核通过或拒绝，更新帖子的状态
          setPosts(prevPosts =>
          (
            prevPosts.map(post =>
              post.id === postId
                ? { ...post, status: statusItem }
                : post
            )
          )

          );
        }
      } else {
        throw new Error(res.message);
      }
    }).catch(err => {
      Msg.error(err.message || t('adminPosts.auditFailed'));
      console.error(err);
    })
  };

  // 切换帖子精华状态
  const handleToggleEssence = async (postId: number, currentEssence: number) => {
    const newEssence = currentEssence != 0 ? 0 : 1;
    const action = newEssence == 1 ? t('adminPosts.setAsEssence') : t('adminPosts.removeEssence');

    const result = await Msg.confirm(
      t('adminPosts.essenceConfirm', { action })
    );

    if (result) {
      handleSetEssence(postId, newEssence);
    }
  };

  // 设置帖子精华状态
  const handleSetEssence = async (postId: number, isEssence: number) => {
    const action = isEssence != 0 ? t('adminPosts.setAsEssence') : t('adminPosts.removeEssence');
    
    await postsAdminSetPostAsEssence(postId, isEssence).then(res => {
      if (res.success) {
        Msg.success(t('adminPosts.essenceSuccess', { action }));

        // 局部更新帖子的精华状态
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId
              ? { ...post, isEssence }
              : post
          )
        );
      } else {
        throw new Error(res.message);
      }
    }).catch(err => {
      Msg.error(err);
      console.log(err)
    })
  };

  // 组件挂载时加载数据
  useEffect(() => {
    loadPosts();
  }, [page, pageSize]);

  // 创建节流刷新函数，每5秒最多执行一次
  const throttledRefresh = useCallback(throttle(() => {
    Msg.success(t('adminPosts.refreshingMessage'));
    loadPosts();
  }, 5000), []) ;

  // 创建节流搜索函数，每5秒最多执行一次
  const throttledSearch = useCallback(throttle(() => {
    setPage(1); // 重置到第一页
    loadPosts();
  }, 5000), []) ;

  return (
    <div className="admin-posts-container">
      <h1>{t('adminPosts.title')}</h1>

      {/* 查询条件区域 */}
      <div className="admin-search-filters">
        <div className="filter-row">
          <div className="filter-item">
            <label htmlFor="keyword">{t('adminPosts.keywordLabel')}</label>
            <input
              id="keyword"
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={t('adminPosts.keywordLabel')}
            />
          </div>
          
          <div className="filter-item">
            <label htmlFor="status">{t('adminPosts.statusLabel')}</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">{t('adminPosts.allStatus')}</option>
              <option value={PostCommentStatusEnum.PASS}>{t('adminPosts.pass')}</option>
              <option value={PostCommentStatusEnum.REJECT}>{t('adminPosts.reject')}</option>
              <option value={PostCommentStatusEnum.PENDING}>{t('adminPosts.pending')}</option>
              <option value={PostCommentStatusEnum.DELETE}>{t('adminPosts.delete')}</option>
            </select>
          </div>
          
          <div className="filter-item">
            <label htmlFor="isEssence">{t('adminPosts.essenceLabel')}</label>
            <select
              id="isEssence"
              value={isEssence === undefined ? '' : isEssence.toString()}
              onChange={(e) => {
                const value = e.target.value;
                setIsEssence(value === '' ? undefined : parseInt(value));
              }}
            >
              <option value="">{t('adminPosts.all')}</option>
              <option value="1">{t('adminPosts.essence')}</option>
              <option value="0">{t('adminPosts.notEssence')}</option>
            </select>
          </div>
        </div>
        
        <div className="filter-row">
          <div className="filter-item">
            <label htmlFor="clubIds">{t('adminPosts.clubIdsLabel')}</label>
            <input
              id="clubIds"
              type="text"
              value={clubIds}
              onChange={(e) => setClubIds(e.target.value)}
              placeholder={t('adminPosts.clubIdsLabel')}
            />
          </div>
          
          <div className="filter-item">
            <label htmlFor="userIds">{t('adminPosts.userIdsLabel')}</label>
            <input
              id="userIds"
              type="text"
              value={userIds}
              onChange={(e) => setUserIds(e.target.value)}
              placeholder={t('adminPosts.userIdsLabel')}
            />
          </div>
          
          <div className="filter-actions">
            <button
              className="search-button"
              onClick={throttledSearch}
            >
              {t('adminPosts.searchButton')}
            </button>
            <button
              className="reset-button"
              onClick={() => {
                setKeyword('');
                setStatus('');
                setClubIds('');
                setUserIds('');
                setIsEssence(undefined);
                setPage(1); // 重置到第一页
                loadPosts();
              }}
            >
              {t('adminPosts.resetButton')}
            </button>
          </div>
        </div>
      </div>

      {/*操作面板*/}
      <div className="action-buttons">
        <button
          className="btn btn-primary batch-audit-btn"
          onClick={() => Msg.error(t('adminPosts.cannotBatchAudit'))}
          disabled={selectedPosts.length === 0}
        >
          {t('adminPosts.batchAudit')} {selectedPosts.length > 0 && `(${selectedPosts.length} ${t('adminPosts.selected')})`}
        </button>
        <button
          className="btn btn-success"
          onClick={() => setShowAuditDialog(true)}
        >
          {t('adminPosts.gotoAuditView')}
        </button>
      </div>

      <div className="pagination-info">
        <span>{t('adminPosts.showingEntries', { 
          start: (page - 1) * pageSize + 1, 
          end: Math.min(page * pageSize, total), 
          total 
        })}</span>
        <button
          className="refresh-button"
          onClick={throttledRefresh}
          title={t('adminPosts.refreshTooltip')}
        >
          {t('adminPosts.refreshButton')}
        </button>
      </div>

      <ShowTable
        data={posts}
        renderItem={(item) => (
          <tr>
            <td>
              <input
                type="checkbox"
                checked={selectedPosts.includes(item.id)}
                onChange={() => handleSelectPost(item.id)}
              />
            </td>
            <td>{item.id}</td>
            <td>{item.title == "" ? t('adminPosts.noTitle') : item.title}</td>
            <td>{`${getSingleSimpleUserInfo(item.userId).name}(id: ${item.userId})`}</td>
            <td>

              <button
                className="audit-button"
                onClick={() => handleAuditPost(item.id)}
              >
                {item.status}
              </button></td>
            <td>
              <button
                className={`essence-button ${item.isEssence != 0 ? 'yes' : 'no'}`}
                onClick={() => handleToggleEssence(item.id, item.isEssence)}
              >
                {item.isEssence != 0 ? 'Yes' : 'No'}
              </button>
            </td>
            <td>
              <span className="interaction-stats">
                <span className="stat-item">
                  <EyeIcon className="stat-icon" />
                  {item.viewCount}
                </span>
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
            <td>
              <button 
                className="btn btn-secondary">{t('adminPosts.moreButton')}</button>
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
          <th>{t('adminPosts.postIdHeader')}</th>
          <th>{t('adminPosts.titleHeader')}</th>
          <th>{t('adminPosts.authorHeader')}</th>
          <th>{t('adminPosts.statusHeader')}</th>
          <th>{t('adminPosts.essenceHeader')}</th>
          <th>{t('adminPosts.interactionsHeader')}</th>
          <th>{t('adminPosts.detailsHeader')}</th>
        </tr>)}
        emptyContent={<div>{t('adminPosts.noPostsFound')}</div>}
      />

      <Pagination
        currentPage={page}
        totalPages={Math.ceil(total / pageSize)}
        loading={loading}
        onPageChange={setPage}
      />
      
      {/* 审核对话框 */}
      {showAuditDialog && (
        <AuditPostDialog onClose={() => setShowAuditDialog(false)}/>
      )}
    </div>
  )
};

export default AdminPosts;
