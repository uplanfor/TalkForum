import { ArrowLeftIcon, MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/20/solid";
import BackgroundImg from "../components/BackgroundImg";
import PostsContainer, { PostContainerTargetType, type PostsContainerSearchParams } from "../components/PostsContainer";
import { DefaultBackgroundUrl } from "../constants/default";
import {useNavigate, useSearchParams, useLocation} from 'react-router-dom';
import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { useTranslation } from "react-i18next";
import "./styles/style_search.css"

const Search = ()=> {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const [mySearchParams, setMySearchParams]  = useState<PostsContainerSearchParams>();
    const [showFilters, setShowFilters] = useState(false);
    const keywordInput = useRef<HTMLInputElement>(null);
    const tagInput = useRef<HTMLInputElement>(null);
    const clubIdInput = useRef<HTMLInputElement>(null);
    const userIdsInput = useRef<HTMLInputElement>(null);
    
    
    // 处理搜索功能
    const handleSearch = () => {
        // 获取搜索关键词
        const keyword = keywordInput.current?.value.trim();
        const tag = tagInput.current?.value.trim();
        const clubId = clubIdInput.current?.value.trim();
        const userIds = userIdsInput.current?.value.trim();
        
        // 组装搜索参数
        const newParams = new URLSearchParams();
        if (keyword) {
            newParams.append('keyword', keyword);
        }
        if (tag) {
            newParams.append('tag', tag);
        }
        if (clubId) {
            newParams.append('clubId', clubId);
        }
        if (userIds) {
            newParams.append('userIds', userIds);
        }

        // console.log (newParams.toString());

        // // 替换当前页面url，重新加载
        navigate(`/search?${newParams.toString()}`, { replace: true });

        // // TODO: 真不会了，只能这样修了
        // window.location.reload();
        // location.search = newParams.toString();
    };

    
    // 处理回车键搜索
    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    
    // 当URL参数变化时，更新搜索参数并触发PostsContainer重新加载
    useEffect(() => {
        // 获取搜索参数
        const searchParams = new URLSearchParams(location.search);
        const keyword = searchParams.get('keyword');
        const tag = searchParams.get('tag');
        const clubId = searchParams.get('clubId');
        const userIds = searchParams.get('userIds');
        
        // 设置输入框的值
        if (keywordInput.current) {
            keywordInput.current.value = keyword || '';
        }
        if (tagInput.current) {
            tagInput.current.value = tag || '';
        }
        if (clubIdInput.current) {
            clubIdInput.current.value = clubId || '';
        }
        if (userIdsInput.current) {
            userIdsInput.current.value = userIds || '';
        }
        
        // 处理userIds参数
        let parsedUserIds: number[] | undefined;
        if (userIds) {
            try {
                parsedUserIds = userIds.split(',').map(id => {
                    const numId = parseInt(id.trim(), 10);
                    return isNaN(numId) ? null : numId;
                }).filter(id => id !== null) as number[];
            } catch (error) {
                console.error('Error parsing userIds parameter:', error);
            }
        }
        
        // 处理clubIds参数
        let parsedClubIds: number[] | undefined;
        if (clubId) {
            try {
                const clubIdNum = parseInt(clubId.trim(), 10);
                if (!isNaN(clubIdNum)) {
                    parsedClubIds = [clubIdNum];
                }
            } catch (error) {
                console.error('Error parsing clubId parameter:', error);
            }
        }
        
        // 构建搜索参数对象
        const newSearchParams: PostsContainerSearchParams = {
            keyword: keyword || '',
            tag: tag || undefined,
            userIds: parsedUserIds,
            clubIds: parsedClubIds
        };

        // console.log(newSearchParams);
        
        // 更新状态，确保PostsContainer能够重新加载
        setMySearchParams(newSearchParams);
        // console.log(newSearchParams);
    }, [location.search]); // 监听URL参数的变化
    
    return <>
            <div className="search-header">
                {/* 返回按钮 */}
                <ArrowLeftIcon onClick={()=>navigate(-1)} style={{cursor: 'pointer'}}></ArrowLeftIcon>  
                
                {/* 搜索输入组合 */}
                <div className="search-combo">
                    <MagnifyingGlassIcon /> {/* 搜索图标 */}
                    <input 
                        type="text" 
                        placeholder={t('search.placeholder')}
                        ref={keywordInput}
                        onKeyPress={handleKeyPress}
                    /> {/* 搜索输入框 */}
                    {/* 筛选按钮 */}
                    <FunnelIcon 
                        onClick={() => setShowFilters(!showFilters)} 
                        style={{cursor: 'pointer', marginLeft: '8px', color: 'var(--neutral-text-secondary)'}} 
                    /> 
                </div>
                
                {/* 搜索按钮 */}
                <button onClick={handleSearch}>
                    <span className="search-button-text">{t('search.searchButton')}</span>
                    <span className="search-button-icon">🔍</span>
                </button>
            </div>
            
            {/* 遮罩层 */}
            {showFilters && (
                <div className="filter-mask" onClick={() => setShowFilters(false)}></div>
            )}
            
            {/* 筛选条件面板 */}
            {showFilters && (
                <div className="search-filters">
                    <div className="filter-group">
                        <label>{t('search.userIdLabel')}:</label>
                        <input 
                            type="text" 
                            placeholder={t('search.userIdPlaceholder')}
                            ref={userIdsInput}
                        />
                    </div>
                    
                    <div className="filter-group">
                        <label>{t('search.tagLabel')}:</label>
                        <input 
                            type="text" 
                            placeholder={t('search.tagPlaceholder')}
                            ref={tagInput}
                        />
                    </div>
                    
                    <div className="filter-group">
                        <label>{t('search.clubIdLabel')}:</label>
                        <input 
                            type="text" 
                            placeholder={t('search.clubIdPlaceholder')} 
                            ref={clubIdInput}
                        />
                    </div>
                    
                    <div className="filter-actions">
                        <button onClick={() => setShowFilters(false)}>{t('search.closeButton')}</button>
                        <button onClick={handleSearch}>{t('search.applyFiltersButton')}</button>
                    </div>
                </div>
            )}
        <div style={{height: 80}}></div>
        <PostsContainer 
            targetType={PostContainerTargetType.SEARCH} 
            searchParams={mySearchParams}
        ></PostsContainer>
    </>
}

export default Search;