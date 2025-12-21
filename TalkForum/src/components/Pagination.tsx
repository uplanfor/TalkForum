/**
 * 分页组件
 * 提供分页导航功能
 */
import { useState, useEffect } from 'react';
import './styles/style_pagination.css';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    loading?: boolean;
    onPageChange: (page: number) => void;
}

const Pagination = ({
    currentPage,
    totalPages,
    loading = false,
    onPageChange,
}: PaginationProps) => {
    const [pageInput, setPageInput] = useState(currentPage.toString());

    // 当currentPage变化时，更新pageInput
    useEffect(() => {
        setPageInput(currentPage.toString());
    }, [currentPage]);

    const handleFirst = () => onPageChange(1);
    const handlePrevious = () => onPageChange(Math.max(1, currentPage - 1));
    const handleNext = () => onPageChange(Math.min(totalPages, currentPage + 1));
    const handleLast = () => onPageChange(totalPages);

    const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPageInput(e.target.value);
    };

    const handlePageInputSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const page = parseInt(pageInput);
        if (!isNaN(page) && page >= 1 && page <= totalPages) {
            onPageChange(page);
        } else {
            // 重置为当前页
            setPageInput(currentPage.toString());
        }
    };

    const handlePageInputBlur = () => {
        // 失去焦点时跳转到目标页面
        const page = parseInt(pageInput);
        if (!isNaN(page) && page >= 1 && page <= totalPages) {
            onPageChange(page);
        } else {
            // 如果输入无效，重置为当前页
            setPageInput(currentPage.toString());
        }
    };

    return (
        <div className='pagination-controls'>
            <button onClick={handleFirst} disabled={currentPage === 1 || loading}>
                First
            </button>
            <button onClick={handlePrevious} disabled={currentPage === 1 || loading}>
                Previous
            </button>

            <div className='page-info-container'>
                <span className='page-info'>Page</span>
                <form onSubmit={handlePageInputSubmit} className='page-input-form'>
                    <input
                        type='number'
                        min='1'
                        max={totalPages || 1}
                        value={pageInput}
                        onChange={handlePageInputChange}
                        onBlur={handlePageInputBlur}
                        className='page-input'
                        disabled={loading}
                    />
                </form>
                <span className='page-info'>of {totalPages || 1}</span>
            </div>

            <button onClick={handleNext} disabled={currentPage >= totalPages || loading}>
                Next
            </button>
            <button onClick={handleLast} disabled={currentPage >= totalPages || loading}>
                Last
            </button>
        </div>
    );
};

export default Pagination;
