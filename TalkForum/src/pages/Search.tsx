import { ArrowLeftIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/20/solid';
import PostsContainer, {
    PostContainerTargetType,
    type PostsContainerSearchParams,
} from '../components/PostsContainer';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { memo, useState, useRef, useEffect, type KeyboardEvent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './styles/style_search.css';

const Search = memo(() => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const [showFilters, setShowFilters] = useState(false);
    const keywordInput = useRef<HTMLInputElement>(null);
    const tagInput = useRef<HTMLInputElement>(null);
    const clubIdInput = useRef<HTMLInputElement>(null);
    const userIdsInput = useRef<HTMLInputElement>(null);

    // 获取搜索参数
    const searchParams = new URLSearchParams(location.search);
    const keyword = searchParams.get('keyword');
    const tag = searchParams.get('tag');
    const clubId = searchParams.get('clubId');
    const userIds = searchParams.get('userIds');

    const mySearchParams = useMemo<PostsContainerSearchParams>(() => ({
        keyword: keyword ?? '',
        tag: tag ?? undefined,
    }), [keyword, tag]);

    useEffect(() => {
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
    }, [keyword, tag, clubId, userIds]);

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

        console.log("导航");
        
        // // 替换当前页面url，重新加载
        navigate(`/search?${newParams.toString()}`, { replace: true });
        // setShowFilters(false);
    };

    // 处理回车键搜索
    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <>
            <div className='search-header'>
                {/* 返回按钮 */}
                <ArrowLeftIcon
                    onClick={() => navigate(-1)}
                    style={{ cursor: 'pointer' }}
                ></ArrowLeftIcon>

                {/* 搜索输入组合 */}
                <div className='search-combo'>
                    <MagnifyingGlassIcon /> {/* 搜索图标 */}
                    <input
                        type='text'
                        placeholder={t('search.placeholder')}
                        ref={keywordInput}
                        onKeyPress={handleKeyPress}
                    />{' '}
                    {/* 搜索输入框 */}
                    {/* 筛选按钮 */}
                    <FunnelIcon
                        onClick={() => setShowFilters(!showFilters)}
                        style={{
                            cursor: 'pointer',
                            marginLeft: '8px',
                            color: 'var(--neutral-text-secondary)',
                        }}
                    />
                </div>

                {/* 搜索按钮 */}
                <button onClick={handleSearch}>
                    <span className='search-button-text'>{t('search.searchButton')}</span>
                </button>
            </div>

            {/* 遮罩层 */}
            {showFilters && (
                <div className='filter-mask' onClick={() => setShowFilters(false)}></div>
            )}

            {/* 筛选条件面板 */}
            {showFilters && (
                <div className='search-filters'>
                    <div className='filter-group'>
                        <label>{t('search.userIdLabel')}:</label>
                        <input
                            type='text'
                            placeholder={t('search.userIdPlaceholder')}
                            ref={userIdsInput}
                        />
                    </div>

                    <div className='filter-group'>
                        <label>{t('search.tagLabel')}:</label>
                        <input
                            type='text'
                            placeholder={t('search.tagPlaceholder')}
                            ref={tagInput}
                        />
                    </div>

                    {/* <div className='filter-group'>
                        <label>{t('search.clubIdLabel')}:</label>
                        <input
                            type='text'
                            placeholder={t('search.clubIdPlaceholder')}
                            ref={clubIdInput}
                        />
                    </div> */}

                    <div className='filter-actions'>
                        <button onClick={() => setShowFilters(false)}>
                            {t('search.closeButton')}
                        </button>
                        <button onClick={handleSearch}>{t('search.applyFiltersButton')}</button>
                    </div>
                </div>
            )}
            <div style={{ height: 80 }}></div>
            <PostsContainer
                targetType={PostContainerTargetType.SEARCH}
                searchParams={mySearchParams}
            ></PostsContainer>
        </>
    );
});

export default Search;
