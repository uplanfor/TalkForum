import React from 'react';
import PopUpDialogBase from './PopUpDialogBase';
import { type Report } from '../api/ApiReports';

interface AuditReportDialogProps {
    onClose: () => void;
    // 预留其他props
    reportId?: number;
    reportData?: Report;
}

const AuditReportDialog = ({ onClose, reportId, reportData }: AuditReportDialogProps) => {
    // 预留功能实现
    
    return (
        <PopUpDialogBase
            title="Audit Report"
            onClose={onClose}
        >
            <div style={{ padding: '20px', textAlign: 'center' }}>
                Audit Report Dialog - 功能待实现
            </div>
        </PopUpDialogBase>
    );
};

export default AuditReportDialog;