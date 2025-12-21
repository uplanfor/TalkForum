/**
 * 帖子发布/编辑对话框组件
 * 用于创建新帖子或修改现有帖子
 * 基于PopUpDialogBase组件构建，支持标题和内容输入
 */
// import "../assets/normalize.css"
import './styles/style_postdialog.css';
import PopUpDialogBase from './PopUpDialogBase';
import { type PopUpDialogButton } from './PopUpDialogBase';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Msg from '../utils/msg';
import { postsCommitPostAuth, postsModifyPostAuth } from '../api/ApiPosts';
import { throttle, debounce } from '../utils/debounce&throttle';

/**
 * 帖子对话框组件属性接口
 */
interface PostDialogProps {
    onClose: () => any; // 关闭对话框的回调函数
    notification?: string; // 对话框标题通知
    title?: string; // 帖子标题（编辑时使用）
    clubInputId?: number; // 俱乐部ID（可选）
    content?: string; // 帖子内容（编辑时使用）
    postId?: number | null; // 帖子ID（编辑时使用，新建时为null）
    tag1?: string | null; // 标签1
    tag2?: string | null; // 标签2
    tag3?: string | null; // 标签3
}

/**
 * 帖子发布/编辑对话框组件
 * @param {PostDialogProps} props - 组件属性
 */
const PostDialog = ({
    onClose,
    notification = '',
    title = '',
    clubInputId = 0,
    content = '',
    postId = null,
    tag1 = '',
    tag2 = '',
    tag3 = '',
}: PostDialogProps) => {
    // 国际化钩子
    const { t } = useTranslation();

    // 标题输入框引用
    const titleRef = useRef<HTMLInputElement>(null);

    // 内容文本域引用
    const contentRef = useRef<HTMLTextAreaElement>(null);

    // 俱乐部ID状态
    const [clubId, setClubId] = useState<number>(clubInputId);

    // 标签状态
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState<string>('');
    const [isAddingTag, setIsAddingTag] = useState<boolean>(false);
    const tagRefs = useRef<(HTMLDivElement | null)[]>([]);
    const tagInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // 节流处理标签添加，控制添加频率
    const throttledAddTag = useCallback(
        throttle(() => {
            if (tags.length < 3 && !isAddingTag) {
                setIsAddingTag(true);
                const newTags = [...tags, ''];
                setTags(newTags);

                // 聚焦到新添加标签的输入框
                setTimeout(() => {
                    const newIndex = newTags.length - 1;
                    if (tagInputRefs.current[newIndex]) {
                        tagInputRefs.current[newIndex]?.focus();
                    }
                }, 10);
            }
        }, 500),
        [tags, isAddingTag]
    );

    // 添加标签
    const handleAddTag = useCallback(() => {
        throttledAddTag();
    }, [throttledAddTag]);

    // 删除标签
    const handleRemoveTag = useCallback(
        (index: number) => {
            setTags(prevTags => {
                const newTags = prevTags.filter((_, i) => i !== index);
                // 如果删除的是正在添加的空标签，重置添加状态
                if (isAddingTag && index === prevTags.length - 1 && !prevTags[index].trim()) {
                    setIsAddingTag(false);
                }
                return newTags;
            });

            // 更新引用数组
            tagRefs.current.splice(index, 1);
            tagInputRefs.current.splice(index, 1);
        },
        [isAddingTag]
    );

    // 处理标签输入框回车事件
    const handleTagInputKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
            }
        },
        [handleAddTag]
    );

    // 处理标签内容变化
    const handleTagChange = useCallback(
        (index: number, value: string) => {
            // 直接更新标签值，不触发额外验证
            const newTags = [...tags];
            newTags[index] = value;
            setTags(newTags);
        },
        [tags]
    );

    // 处理标签失去焦点
    const handleTagBlur = useCallback(
        (index: number) => {
            const tag = tags[index];
            // 去除前后空格
            const trimmedTag = tag.trim();

            // 如果标签为空或只有空格，自动删除
            if (!trimmedTag) {
                handleRemoveTag(index);
            } else {
                // 更新标签内容（去除前后空格）
                const newTags = [...tags];
                newTags[index] = trimmedTag;
                setTags(newTags);

                // 如果是正在添加的标签，重置添加状态
                if (isAddingTag && index === tags.length - 1) {
                    setIsAddingTag(false);
                }
            }
        },
        [tags, isAddingTag, handleRemoveTag]
    );

    // 处理标签键盘事件
    const handleTagKeyDown = useCallback(
        (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
            // If pressing Backspace, focus to previous tag without validation
            if (e.key === 'Backspace' && tags.length > 1) {
                e.preventDefault();
                // 聚焦到前一个标签
                if (tagInputRefs.current[index - 1]) {
                    tagInputRefs.current[index - 1]?.focus();
                }
            }
            // 如果按右箭头且在标签末尾，移动到下一个标签或输入框
            if (e.key === 'ArrowRight') {
                const inputElement = tagInputRefs.current[index];
                if (inputElement && e.currentTarget.selectionStart === inputElement.value.length) {
                    e.preventDefault();
                    if (index < tags.length - 1) {
                        tagInputRefs.current[index + 1]?.focus();
                    } else if (tags.length < 3) {
                        // 聚焦到输入框
                        const inputElement = document.querySelector('.post-dialog-tag-input');
                        if (inputElement) {
                            (inputElement as HTMLInputElement).focus();
                        }
                    }
                }
            }
            // 如果按左箭头且在标签开头，移动到前一个标签
            if (e.key === 'ArrowLeft' && e.currentTarget.selectionStart === 0 && index > 0) {
                e.preventDefault();
                tagInputRefs.current[index - 1]?.focus();
                // 将光标移动到前一个标签末尾
                const prevInput = tagInputRefs.current[index - 1];
                if (prevInput) {
                    setTimeout(() => {
                        prevInput.focus();
                        prevInput.setSelectionRange(prevInput.value.length, prevInput.value.length);
                    }, 10);
                }
            }
        },
        [tags]
    );

    // 创建稳定的ref回调函数
    const setTagRef = useCallback(
        (index: number) => (el: HTMLDivElement | null) => {
            tagRefs.current[index] = el;
        },
        []
    );

    const setTagInputRef = useCallback(
        (index: number) => (el: HTMLInputElement | null) => {
            tagInputRefs.current[index] = el;
        },
        []
    );

    // 使用useMemo优化标签渲染，避免不必要的重新渲染
    const tagElements = useMemo(
        () =>
            tags.map((tag, index) => (
                <div key={`tag-${index}`} className={`post-tag${index + 1}`} ref={setTagRef(index)}>
                    <button
                        className='post-tag-remove'
                        onClick={e => {
                            e.stopPropagation();
                            handleRemoveTag(index);
                        }}
                        onMouseDown={e => e.preventDefault()}
                    >
                        ×
                    </button>
                    <input
                        type='text'
                        className='post-tag-input'
                        ref={setTagInputRef(index)}
                        value={tag}
                        onChange={e => {
                            const value = e.target.value.slice(0, 16);
                            handleTagChange(index, value);
                        }}
                        onBlur={() => handleTagBlur(index)}
                        onKeyDown={e => handleTagKeyDown(index, e)}
                        placeholder={t('postDialog.tagPlaceholder')}
                    />
                </div>
            )),
        [
            tags,
            handleRemoveTag,
            handleTagChange,
            handleTagBlur,
            handleTagKeyDown,
            setTagRef,
            setTagInputRef,
        ]
    );

    // 使用useMemo优化添加按钮渲染
    const addTagButton = useMemo(
        () =>
            tags.length < 3 ? (
                <button className='post-dialog-tag-add-btn' onClick={handleAddTag}>
                    {t('postDialog.addTag')}
                </button>
            ) : null,
        [tags.length, handleAddTag]
    );

    /**
     * 节流处理的提交帖子方法
     * 防止频繁提交，支持发布新帖子和修改现有帖子
     */
    const throttleCommitPost = throttle(async () => {
        if (!contentRef.current) {
            return;
        }

        // 将tags数组转换为三个独立的标签参数
        const tag1 = tags[0] || '';
        const tag2 = tags[1] || '';
        const tag3 = tags[2] || '';

        // 判断是否是修改帖子还是发布帖子
        if (postId == null) {
            // 发布新帖子
            await postsCommitPostAuth({
                content: contentRef.current.value,
                title: titleRef.current?.value,
                clubId: clubId == 0 ? null : clubId,
                tag1,
                tag2,
                tag3,
            })
                .then(res => {
                    if (res.success) {
                        Msg.success(res.message);
                        onClose();
                    } else {
                        throw new Error(res.message);
                    }
                })
                .catch(err => {
                    Msg.error(err);
                });
        } else {
            // 修改现有帖子
            await postsModifyPostAuth(postId, {
                content: contentRef.current.value,
                title: titleRef.current?.value,
                clubId: clubId == 0 ? null : clubId,
                tag1,
                tag2,
                tag3,
            })
                .then(res => {
                    if (res.success) {
                        Msg.success(res.message);
                        onClose();
                    } else {
                        throw new Error(res.message);
                    }
                })
                .catch(err => {
                    Msg.error(err);
                });
        }
    }, 500);

    // 底部按钮配置
    const bottomBtns: PopUpDialogButton[] = [
        {
            text: t('postDialog.cancel'),
            onClick: () => {
                onClose();
            },
            type: 'cancel',
        },
        {
            text: t('postDialog.post'),
            onClick: () => {
                throttleCommitPost();
            },
            type: 'submit',
        },
    ];

    // 底部左侧内容（俱乐部选择按钮）
    const footerLeft = (
        <button className='post-dialog-select-club'>{t('postDialog.selectClub')}</button>
    );

    // 工具条内容（预留markdown编辑器工具条位置）
    const toolBox = (
        <div className='post-dialog-toolbox-content'>{/* 预留markdown编辑器工具条 */}</div>
    );

    /**
     * 组件挂载时的初始化效果
     * 设置标题和内容输入框的值，并将焦点放在内容输入框上
     */
    useEffect(() => {
        // 给标题输入框赋值
        if (titleRef.current) {
            titleRef.current.value = title;
        }
        // 给内容文本域赋值
        if (contentRef.current) {
            contentRef.current.value = content;
            contentRef.current.focus();
        }

        // 初始化标签
        const initialTags = [];
        if (tag1?.trim()) initialTags.push(tag1.trim());
        if (tag2?.trim()) initialTags.push(tag2.trim());
        if (tag3?.trim()) initialTags.push(tag3.trim());
        setTags(initialTags);
    }, []);

    return (
        <PopUpDialogBase
            title={notification || t('postDialog.createPost')}
            onClose={onClose}
            footerLeft={footerLeft}
            bottomBtns={bottomBtns}
            toolBox={toolBox}
        >
            {/* 主体内容容器 - 使用flex布局让textarea占满剩余空间 */}
            <div className='post-dialog-content-container'>
                {/* 帖子标题输入框 */}
                <input
                    type='text'
                    className='post-dialog-input'
                    placeholder={t('postDialog.titlePlaceholder')}
                    ref={titleRef}
                />

                {/* 标签编辑区域 */}
                <div className='post-dialog-tags-container'>
                    <div className='post-dialog-tag-editor'>
                        {/* 已添加的标签 */}
                        {tagElements}

                        {/* 标签添加按钮 */}
                        {addTagButton}
                    </div>
                </div>

                {/* 帖子内容输入框 */}
                <textarea
                    className='post-dialog-textarea'
                    placeholder={t('postDialog.contentPlaceholder')}
                    ref={contentRef}
                ></textarea>
            </div>
        </PopUpDialogBase>
    );
};

export default PostDialog;
