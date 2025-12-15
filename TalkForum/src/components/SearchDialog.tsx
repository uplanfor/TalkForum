/**
 * 搜索对话框组件
 * 提供搜索功能，包括搜索输入、热门话题和搜索历史
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
// import "../assets/normalize.css"
import "./styles/style_searchdialog.css"
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

/**
 * 搜索对话框属性接口
 */
interface SearchDialogProps {
    /**
     * 关闭对话框的回调函数
     */
    onClose: () => void;
}

/**
 * 搜索对话框组件
 * 提供搜索功能，包括搜索输入、热门话题和搜索历史
 */
const SearchDialog = (props : SearchDialogProps) => {
    const { onClose } = props;
    const navigate = useNavigate();
    
    // 国际化钩子
    const { t } = useTranslation();
    
    // 是否正在关闭状态，用于动画效果
    const [isClosing, setIsClosing] = useState(false);
    
    // 组件是否已挂载状态，用于防止内存泄漏
    const [isMounted, setIsMounted] = useState(false);
    
    // 搜索输入框内容状态
    const [searchKeyword, setSearchKeyword] = useState("");
    
    // 处理搜索函数
    const handleSearch = () => {
        if (searchKeyword.trim()) {
            navigate(`/search?keyword=${encodeURIComponent(searchKeyword)}`);
        }
    };

    /**
     * 组件挂载时设置isMounted为true，卸载时设置为false
     */
    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    /**
     * 关闭搜索对话框
     * 添加关闭动画效果，延迟300ms后调用onClose回调
     */
    const closeSearchDialog = () => {
        if (!isMounted) return;
        
        // 设置关闭状态，触发关闭动画
        setIsClosing(true);
        
        // 延迟300ms后调用onClose回调
        const timer = setTimeout(() => {
            if (isMounted) {
                onClose();
            }
        }, 300);
        
        return () => clearTimeout(timer);
    }

    /**
     * 监听键盘事件，按下Escape键时关闭对话框
     */
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeSearchDialog();
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className={`cover ${isClosing ? 'closing' : ''}`}>
            {/* 搜索对话框头部 */}
            <div className="header">
                {/* 返回按钮 */}
                <ArrowLeftIcon onClick={closeSearchDialog} style={{cursor: 'pointer'}}></ArrowLeftIcon>
                
                {/* 搜索输入组合 */}
                <div className="combo">
                    <MagnifyingGlassIcon /> {/* 搜索图标 */}
                    <input 
                        type="text" 
                        placeholder={t('searchDialog.placeholder')} 
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch();
                            }
                        }}
                    /> {/* 搜索输入框 */}
                </div>
                
                {/* 搜索按钮 */}
                <button onClick={handleSearch}>{t('searchDialog.searchButton')}</button>
            </div>
            
            {/* 搜索对话框内容 */}
            <div className="content">
                {/* 热门话题 */}
                <h2>{t('searchDialog.hotTopics')}</h2>
                <p>
                    <span>Computer Science</span> 
                    <span>Food</span> 
                    <span>Art</span> 
                </p>
                
                {/* 搜索历史 */}
                <h2>{t('searchDialog.searchHistory')}</h2>
                <p> <span>Never</span> </p>
            </div>
        </div>
    );
};

export default SearchDialog;
