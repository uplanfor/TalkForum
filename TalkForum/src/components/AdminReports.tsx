import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ShowTable from './ShowTable';
import Pagination from './Pagination';
import AuditReportDialog from './AuditReportDialog';
import {
    reportsAdminGetReports,
    reportsAdminHandleReport,
    type Report,
    type ReportPage,
} from '../api/ApiReports';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState, type AppDispatch } from '../store';
import { useNavigate } from 'react-router-dom';
import Msg from '../utils/msg';
import { debounce, throttle } from '../utils/debounce&throttle';
import dayjs from 'dayjs';
import { getSingleSimpleUserInfo, updateSimpleUserInfoCache } from '../utils/simpleUserInfoCache';
import { ReportTargetConstant, ReportProcessConstant } from '../constants/report_constant';
import './styles/style_admin_common.css';

const AdminReports = () => {
    const { t } = useTranslation();
    // 从Redux获取当前用户信息
    const { id: currentUserId } = useSelector((state: RootState) => state.user);
    // const dispatch = useDispatch<AppDispatch>();
    // const navigate = useNavigate();
    const [reports, setReports] = useState<Report[]>([]);
    const [page, setPage] = useState<number>(1);
    const [pageSize] = useState<number>(10);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedReports, setSelectedReports] = useState<Set<number>>(new Set());
    const [showAuditDialog, setShowAuditDialog] = useState<boolean>(false);
    const [currentReport, setCurrentReport] = useState<Report | null>(null);
    const [selectAll, setSelectAll] = useState<boolean>(false);

    // Query conditions
    const [queryConditions, setQueryConditions] = useState({
        reportTargetType: '',
        status: '',
    });

    // Load reports list
    const loadReports = async (pageNum: number, query = queryConditions) => {
        setLoading(true);
        try {
            // Prepare query parameters
            const params: any = {
                page: pageNum,
                pageSize: pageSize,
            };

            // Only add non-empty parameters
            if (query.reportTargetType) {
                params.reportTargetType = query.reportTargetType;
            }

            // Only add status parameter if it has a value
            if (query.status) {
                params.status = query.status;
            }

            const reportData = await reportsAdminGetReports(
                params.page,
                params.pageSize,
                params.reportTargetType,
                params.status
            );

            await updateSimpleUserInfoCache(reportData.data.data.map(report => report.userId));

            // Extract the actual report page data from the API response
            const reportPageData = reportData.data as ReportPage;
            setReports(reportPageData.data);
            setTotal(reportPageData.total);
        } catch (err) {
            console.error('Failed to load reports:', err);
            Msg.error(err as string);
            setReports([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        loadReports(page);
    }, [page]);

    // Create throttled refresh function, maximum once per 5 seconds
    const throttledRefresh = useCallback(
        throttle(() => {
            Msg.success(t('adminReports.refreshingMessage'));
            loadReports(page);
        }, 5000),
        [page]
    );

    // 获取目标类型的标签
    const getTargetTypeLabel = (type: string) => {
        switch (type) {
            case ReportTargetConstant.POST:
                return t('adminReports.post');
            case ReportTargetConstant.COMMENT:
                return t('adminReports.comment');
            case ReportTargetConstant.USER:
                return t('adminReports.user');
            case ReportTargetConstant.CLUB:
                return t('adminReports.club');
            default:
                return type;
        }
    };

    // Handle query condition change - use debounce
    const handleQueryChange = debounce((field: string, value: string) => {
        setQueryConditions(prev => ({
            ...prev,
            [field]: value,
        }));
    }, 300);

    // Apply query conditions
    const applyQuery = () => {
        setPage(1);
        loadReports(1, queryConditions);
    };

    // Reset query conditions
    const resetQuery = () => {
        const newQueryConditions = {
            reportTargetType: '',
            status: '',
        };
        setQueryConditions(newQueryConditions);
        setPage(1);
        loadReports(1, newQueryConditions);
    };

    // Handle selection change
    const handleSelectReport = (reportId: number) => {
        setSelectedReports(prev => {
            if (prev.has(reportId)) {
                // If already selected, deselect it and set selectAll to false
                setSelectAll(false);
                const newSet = new Set(prev);
                newSet.delete(reportId);
                return newSet;
            } else {
                // If not selected, add it to the selection
                return new Set([...prev, reportId]);
            }
        });
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedReports(new Set());
        } else {
            setSelectedReports(new Set(reports.map(report => report.id)));
        }
        setSelectAll(!selectAll);
    };

    // Check if all items are selected
    const isAllSelected = reports.length > 0 && selectedReports.size === reports.length;

    // Handle selected reports audit
    const handleAuditSelected = async () => {
        if (selectedReports.size === 0) {
            Msg.error(t('adminReports.selectReportsToAudit'));
            return;
        }

        try {
            const reportIds = Array.from(selectedReports);
            const res = await reportsAdminHandleReport(reportIds, 'HANDLED');
            if (res.success) {
                Msg.success(res.message);
            } else {
                Msg.error(res.message);
            }
            // Clear selection and refresh the list
            setSelectedReports(new Set());
            setSelectAll(false);
            loadReports(page, queryConditions);
        } catch (error) {
            console.error('Failed to handle reports:', error);
            Msg.error(t('adminReports.handleReportsFailed'));
        }
    };

    // 处理单个举报
    const handleAuditReport = async (reportId: number) => {
        try {
            const res = await reportsAdminHandleReport([reportId], 'HANDLED');
            if (res.success) {
                Msg.success(res.message);
            } else {
                Msg.error(res.message);
            }
            // Refresh the list
            loadReports(page, queryConditions);
        } catch (error) {
            console.error('Failed to handle report:', error);
            Msg.error(t('adminReports.handleReportFailed'));
        }
    };

    // Open audit dialog
    const openAuditDialog = (report: Report) => {
        setCurrentReport(report);
        setShowAuditDialog(true);
    };

    // Close audit dialog
    const closeAuditDialog = () => {
        setShowAuditDialog(false);
        setCurrentReport(null);
        // Refresh list
        loadReports(page, queryConditions);
    };

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className='admin-reports-container'>
            <h1>{t('adminReports.title')}</h1>

            {/* Search filters area */}
            <div className='admin-search-filters'>
                <div className='filter-row'>
                    <div className='filter-item'>
                        <label>{t('adminReports.targetTypeLabel')} </label>
                        <select
                            value={queryConditions.reportTargetType}
                            onChange={e => handleQueryChange('reportTargetType', e.target.value)}
                        >
                            <option value=''>{t('adminReports.allTypes')}</option>
                            <option value={ReportTargetConstant.POST}>
                                {t('adminReports.post')}
                            </option>
                            <option value={ReportTargetConstant.COMMENT}>
                                {t('adminReports.comment')}
                            </option>
                            <option value={ReportTargetConstant.USER}>
                                {t('adminReports.user')}
                            </option>
                            <option value={ReportTargetConstant.CLUB}>
                                {t('adminReports.club')}
                            </option>
                        </select>
                    </div>
                    <div className='filter-item'>
                        <label>{t('adminReports.statusLabel')} </label>
                        <select
                            value={queryConditions.status}
                            onChange={e => handleQueryChange('status', e.target.value)}
                        >
                            <option value=''>{t('adminReports.allStatus')}</option>
                            <option value={ReportProcessConstant.PENDING}>
                                {t('adminReports.pending')}
                            </option>
                            <option value={ReportProcessConstant.HANDLED}>
                                {t('adminReports.handled')}
                            </option>
                        </select>
                    </div>
                </div>
                <div className='filter-row'> 
                        <button onClick={applyQuery} className='search-button'>
                            {t('adminReports.searchButton')}
                        </button>
                        <button onClick={resetQuery} className='reset-button'>
                            {t('adminReports.resetButton')}
                        </button>
                </div>
            </div>

            {/* Action buttons area */}
            <div className='action-buttons'>
                <button
                    className='btn btn-primary'
                    onClick={handleAuditSelected}
                    disabled={selectedReports.size === 0}
                >
                    {t('adminReports.auditSelected')} ({selectedReports.size})
                </button>
            </div>

            <div className='pagination-info'>
                <span>
                    {t('adminReports.showingEntries', {
                        start: (page - 1) * pageSize + 1,
                        end: Math.min(page * pageSize, total),
                        total,
                    })}
                </span>
                <button
                    className='refresh-button'
                    onClick={throttledRefresh}
                    title={t('adminReports.refreshTooltip')}
                >
                    {t('adminReports.refreshButton')}
                </button>
            </div>

            <ShowTable
                data={reports}
                renderItem={item => (
                    <tr>
                        <td>
                            <input
                                type='checkbox'
                                checked={selectedReports.has(item.id)}
                                onChange={() => handleSelectReport(item.id)}
                            />
                        </td>
                        <td>{item.id}</td>
                        <td>
                            <div className='user-info'>
                                <img
                                    src={getSingleSimpleUserInfo(item.userId).avatarLink}
                                    alt='Avatar'
                                    className='user-avatar'
                                    onClick={() => window.open(`/user/${item.userId}`)}
                                />
                                <span>{`${getSingleSimpleUserInfo(item.userId).name}(id: ${item.userId})`}</span>
                            </div>
                        </td>
                        <td>{`${getTargetTypeLabel(item.reportTargetType)}(id: ${item.reportTarget})`}</td>
                        <td>{item.reason}</td>
                        <td>{item.status}</td>
                        <td>{dayjs(item.createdAt).format('YYYY-MM-DD HH:mm:ss')}</td>
                        <td>
                            {item.handledAt
                                ? dayjs(item.handledAt).format('YYYY-MM-DD HH:mm:ss')
                                : '-'}
                        </td>
                        <td>
                            <button
                                className='btn btn-sm btn-primary'
                                onClick={() => handleAuditReport(item.id)}
                            >
                                {t('adminReports.auditButton')}
                            </button>
                        </td>
                    </tr>
                )}
                renderHeader={() => (
                    <tr>
                        <th>
                            <input
                                type='checkbox'
                                checked={isAllSelected}
                                onChange={handleSelectAll}
                            />
                        </th>
                        <th>{t('adminReports.idHeader')}</th>
                        <th>{t('adminReports.reportByHeader')}</th>
                        <th>{t('adminReports.targetHeader')}</th>
                        <th>{t('adminReports.reasonHeader')}</th>
                        <th>{t('adminReports.statusHeader')}</th>
                        <th>{t('adminReports.createdAtHeader')}</th>
                        <th>{t('adminReports.handledAtHeader')}</th>
                        <th>{t('adminReports.actionsHeader')}</th>
                    </tr>
                )}
                emptyContent={<div>{t('adminReports.noReportsFound')}</div>}
            />

            <Pagination
                currentPage={page}
                totalPages={totalPages}
                loading={loading}
                onPageChange={setPage}
            />

            {/* Audit dialog */}
            {showAuditDialog && (
                <AuditReportDialog
                    onClose={closeAuditDialog}
                    reportId={currentReport?.id}
                    // reportData={currentReport}
                />
            )}
        </div>
    );
};

export default AdminReports;
