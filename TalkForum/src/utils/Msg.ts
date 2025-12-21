// 定义 Prompt 返回值类型
interface PromptResult {
    value: string; // 输入框内容
    response: number; // 0=左按钮（取消），1=右按钮（确认），2=超时
}

interface MsgCacheItem {
    count: number;
    duration: number;
    element?: HTMLDivElement; // 非阻塞元素（可选）
    timer?: number;
    // 阻塞弹窗扩展字段
    blockElement?: BlockInstance;
    blockTimer?: number;
    isBlock: boolean;
}

interface MsgState {
    queue: Array<{ text: string; duration?: number; typeConfig: TypeConfig }>;
    currentCount: number;
    maxCount: 10;
    blockInstance: BlockInstance | null;
    nonBlockClass: string;
    cache: Record<string, MsgCacheItem>;
}

interface NonBlockMsgData {
    text: string;
    duration?: number;
    typeConfig: TypeConfig;
}

// 扩展阻塞弹窗结构：新增按钮容器、输入框、Promise resolve 回调
interface BlockInstance {
    mask: HTMLDivElement;
    msgBox: HTMLDivElement;
    btnContainer?: HTMLDivElement;
    inputEl?: HTMLInputElement;
    resolve?: (value: boolean | PromptResult | number) => void; // 扩展支持number（menu返回值）
}

interface TypeConfig {
    bgColor: string;
    icon: string;
}

const msgState: MsgState = {
    queue: [],
    currentCount: 0,
    maxCount: 10,
    blockInstance: null,
    nonBlockClass: 'msg-non-block',
    cache: {},
};

/**
 * 通用创建阻塞弹窗方法（内部复用）
 * @param type - confirm/prompt/menu
 * @param text - 提示文本（非menu类型用）
 * @param duration - 超时时间（ms），<=0 则不超时
 * @param leftBtnText - 左按钮文本
 * @param rightBtnText - 右按钮文本
 * @param texts - 【新增】menu类型专用：菜单项数组
 * @param title - 【新增】menu类型专用：弹窗标题（null/undefined则不显示）
 * @param needComfirm - 【新增】menu类型专用：是否需要确认/取消按钮（默认false）
 * @returns Promise 封装结果
 */
const createBlockDialog = (
    type: 'confirm' | 'prompt' | 'menu', // 扩展type支持menu
    text: string,
    duration: number,
    leftBtnText: string,
    rightBtnText: string,
    texts?: string[], // 新增：menu菜单项数组
    title?: string, // 【新增】menu标题
    needComfirm: boolean = false // 【新增】是否需要确认按钮
): Promise<boolean | PromptResult | number> => {
    // 扩展返回值类型支持number
    return new Promise(resolve => {
        // 1. 创建遮罩层（阻塞页面交互 | z-index=4096 | 响应式）
        const mask = document.createElement('div');
        Object.assign(mask.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: '4096', // 核心：z-index设置为4096
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(2px)',
            padding: '0 16px', // 响应式内边距，避免弹窗贴边
            boxSizing: 'border-box', // 盒模型适配
        });

        // 2. 创建弹窗容器（使用CSS变量配色 | z-index=4097 | 响应式）
        const dialog = document.createElement('div');
        Object.assign(dialog.style, {
            backgroundColor: 'var(--neutral-module)', // 弹窗背景
            borderRadius: '8px',
            padding: '20px',
            width: '100%', // 响应式宽度
            maxWidth: '300px', // 最大宽度限制
            minWidth: '280px', // 最小宽度保证可用性
            boxShadow: `0 4px 12px var(--neutral-shadow)`, // 阴影变量
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            border: `1px solid var(--neutral-border)`, // 边框变量
            zIndex: '4097', // 弹窗层级高于遮罩
            boxSizing: 'border-box', // 盒模型适配
        });

        // 3. 提示文本（【修改】menu类型标题按需显示）
        let textEl: HTMLDivElement | null = null;
        if (type === 'menu') {
            // 【核心修改】title为null/undefined则不创建标题元素
            if (title != null) {
                textEl = document.createElement('div');
                Object.assign(textEl.style, {
                    fontSize: '14px',
                    color: 'var(--neutral-text-main)', // 主文本色
                    lineHeight: '1.6', // 响应式行高，提升可读性
                    wordBreak: 'break-word', // 长文本换行
                });
                textEl.textContent = title;
                dialog.appendChild(textEl);
            }
        } else {
            // 非menu类型保持原有逻辑
            textEl = document.createElement('div');
            textEl.textContent = text || 'Please confirm';
            Object.assign(textEl.style, {
                fontSize: '14px',
                color: 'var(--neutral-text-main)', // 主文本色
                lineHeight: '1.6', // 响应式行高，提升可读性
                wordBreak: 'break-word', // 长文本换行
            });
            dialog.appendChild(textEl);
        }

        // 4. Prompt 专属：输入框（使用CSS变量配色 | 响应式）
        let inputEl: HTMLInputElement | null = null;
        if (type === 'prompt') {
            inputEl = document.createElement('input');
            Object.assign(inputEl.style, {
                padding: '8px 12px',
                border: `1px solid var(--neutral-border)`, // 输入框边框
                borderRadius: '4px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: 'var(--neutral-bg)', // 输入框背景
                color: 'var(--neutral-text-main)', // 输入框文本色
                width: '100%', // 响应式宽度
                boxSizing: 'border-box', // 盒模型适配
            });
            inputEl.placeholder = '请输入内容';
            inputEl.addEventListener('focus', () => {
                inputEl!.style.borderColor = 'var(--secondary-cool)'; // 聚焦边框色
            });
            inputEl.addEventListener('blur', () => {
                inputEl!.style.borderColor = 'var(--neutral-border)'; // 失焦边框色
            });
            dialog.appendChild(inputEl);
        }

        // 【新增】5. Menu 专属：菜单项列表（响应式 + 单选交互）
        let menuContainer: HTMLDivElement | null = null;
        let selectedIndex = -1; // 记录选中的菜单项索引
        if (type === 'menu') {
            // 边界处理：无菜单项直接返回-1
            if (!texts || texts.length === 0) {
                resolve(-1);
                mask.remove();
                dialog.remove();
                return;
            }

            menuContainer = document.createElement('div');
            Object.assign(menuContainer.style, {
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                width: '100%',
                maxHeight: '200px', // 限制最大高度，避免弹窗过高
                overflowY: 'auto', // 超出滚动
                boxSizing: 'border-box',
            });

            // 遍历生成菜单项
            texts.forEach((menuText, index) => {
                const menuItem = document.createElement('div');
                // 初始样式
                Object.assign(menuItem.style, {
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: 'var(--neutral-text-main)',
                    backgroundColor: 'var(--neutral-bg)',
                    border: `1px solid var(--neutral-border)`,
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                });

                // 【核心修改】menu点击逻辑：根据needComfirm区分
                menuItem.addEventListener('click', () => {
                    if (needComfirm) {
                        // 需要确认：仅标记选中状态，不直接返回
                        // 重置所有菜单项样式
                        if (menuContainer) {
                            Array.from(menuContainer.children).forEach(item => {
                                Object.assign((item as HTMLElement).style, {
                                    backgroundColor: 'var(--neutral-bg)',
                                    borderColor: 'var(--neutral-border)',
                                    color: 'var(--neutral-text-main)',
                                });
                            });
                        }
                        // 设置当前选中项样式
                        Object.assign(menuItem.style, {
                            backgroundColor: 'var(--secondary-cool-light)', // 选中背景（浅蓝）
                            borderColor: 'var(--secondary-cool)', // 选中边框（主蓝）
                            color: 'var(--secondary-cool)', // 选中文本色（主蓝）
                        });
                        selectedIndex = index; // 更新选中索引
                    } else {
                        // 不需要确认：点击直接返回索引并销毁弹窗
                        resolve(index);
                        destroyDialog();
                    }
                });

                // 菜单项文本
                const menuTextEl = document.createElement('span');
                menuTextEl.textContent = menuText;
                menuItem.appendChild(menuTextEl);
                if (menuContainer) {
                    menuContainer.appendChild(menuItem);
                }
            });

            dialog.appendChild(menuContainer);
        }

        // 6. 按钮容器（【修改】menu类型按需创建）
        let btnContainer: HTMLDivElement | null = null;
        // 非menu类型 或 menu类型且需要确认按钮 才创建按钮容器
        if (type !== 'menu' || needComfirm) {
            btnContainer = document.createElement('div');
            Object.assign(btnContainer.style, {
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '8px',
                width: '100%', // 响应式宽度
                boxSizing: 'border-box', // 盒模型适配
            });

            // 7. 按钮通用样式（响应式）
            const btnStyle = {
                padding: '8px 16px',
                borderRadius: '4px',
                border: 'none',
                fontSize: '14px',
                cursor: 'pointer',
                minWidth: '70px', // 响应式最小宽度（缩小适配小屏）
                flex: '0 0 auto', // 不拉伸，保持按钮尺寸
                transition: 'background-color 0.2s ease',
                boxSizing: 'border-box', // 盒模型适配
            };

            // 8. 左按钮（取消）- 使用CSS变量配色
            const leftBtn = document.createElement('button');
            leftBtn.textContent = leftBtnText || 'Cancel';
            Object.assign(leftBtn.style, btnStyle, {
                backgroundColor: 'var(--secondary-warm-1)', // 取消按钮背景
                color: 'var(--neutral-text-secondary)', // 取消按钮文本色
                zIndex: '4097', // 按钮层级
            });
            leftBtn.addEventListener('mouseenter', () => {
                leftBtn.style.backgroundColor = 'var(--secondary-warm-2)'; // hover背景
            });
            leftBtn.addEventListener('mouseleave', () => {
                leftBtn.style.backgroundColor = 'var(--secondary-warm-1)'; // 恢复背景
            });
            leftBtn.addEventListener('click', () => {
                if (type === 'confirm') {
                    resolve(false); // 取消返回 false
                } else if (type === 'prompt') {
                    resolve({ value: inputEl?.value || '', response: 0 }); // 取消返回 response=0
                } else if (type === 'menu') {
                    resolve(-1); // 【新增】取消返回-1
                }
                destroyDialogWithCleanup();
            });
            btnContainer.appendChild(leftBtn);

            // 9. 右按钮（确认）- 使用CSS变量配色
            const rightBtn = document.createElement('button');
            rightBtn.textContent = rightBtnText || 'Confirm';
            Object.assign(rightBtn.style, btnStyle, {
                backgroundColor: 'var(--primary)', // 确认按钮背景使用主色调
                color: 'var(--neutral-text-main)', // 主文本色（无对应变量，使用中性色）
                zIndex: '4097', // 按钮层级
            });
            rightBtn.addEventListener('mouseenter', () => {
                rightBtn.style.backgroundColor = 'var(--primary)'; // hover背景
            });
            rightBtn.addEventListener('mouseleave', () => {
                rightBtn.style.backgroundColor = 'var(--primary)'; // 恢复背景
            });
            rightBtn.addEventListener('click', () => {
                if (type === 'confirm') {
                    resolve(true); // 确认返回 true
                } else if (type === 'prompt') {
                    resolve({ value: inputEl?.value || '', response: 1 }); // 确认返回 response=1
                } else if (type === 'menu') {
                    resolve(selectedIndex); // 【新增】确认返回选中索引（未选中则-1）
                }
                destroyDialogWithCleanup();
            });
            btnContainer.appendChild(rightBtn);

            dialog.appendChild(btnContainer);
        }

        mask.appendChild(dialog);
        document.body.appendChild(mask);

        // 10. 超时处理（【修改】duration<=0 不设置超时）
        let timeoutTimer: number | null = null;
        if (duration > 0) {
            // 仅当duration>0时设置超时
            timeoutTimer = window.setTimeout(() => {
                if (type === 'confirm') {
                    resolve(false); // 超时默认返回 false
                } else if (type === 'prompt') {
                    resolve({ value: inputEl?.value || '', response: 2 }); // 超时返回 response=2
                } else if (type === 'menu') {
                    resolve(-1); // 【新增】超时返回-1
                }
                destroyDialogWithCleanup();
            }, duration);
        }

        // 11. 销毁弹窗（通用方法）
        function destroyDialog() {
            if (timeoutTimer) clearTimeout(timeoutTimer);
            mask.remove();
            dialog.remove();
        }

        // 12. 点击遮罩层关闭（可选）
        mask.addEventListener('click', e => {
            if (e.target === mask) {
                if (type === 'confirm') resolve(false);
                else if (type === 'prompt') resolve({ value: inputEl?.value || '', response: 0 });
                else if (type === 'menu') resolve(-1); // 【新增】点击遮罩返回-1
                destroyDialogWithCleanup();
            }
        });

        // 响应式适配：窗口大小变化时重新调整弹窗位置
        const resizeHandler = () => {
            dialog.style.maxWidth = '90vw'; // 极端小屏时占90%视口宽度
        };
        window.addEventListener('resize', resizeHandler);

        // 修改destroyDialog函数，添加移除事件监听器的逻辑
        const originalDestroyDialog = destroyDialog;
        const destroyDialogWithCleanup = () => {
            window.removeEventListener('resize', resizeHandler);
            originalDestroyDialog();
        };

        // 在所有使用destroyDialog的地方，改为使用destroyDialogWithCleanup
        // 更新按钮点击事件
        const leftBtnClickHandler = () => {
            if (type === 'confirm') {
                resolve(false);
            } else if (type === 'prompt') {
                resolve({ value: inputEl?.value || '', response: 0 });
            } else if (type === 'menu') {
                resolve(-1);
            }
            destroyDialogWithCleanup();
        };

        const rightBtnClickHandler = () => {
            if (type === 'confirm') {
                resolve(true);
            } else if (type === 'prompt') {
                resolve({ value: inputEl?.value || '', response: 1 });
            } else if (type === 'menu') {
                resolve(selectedIndex);
            }
            destroyDialogWithCleanup();
        };

        // 更新超时处理
        if (duration > 0) {
            timeoutTimer = window.setTimeout(() => {
                if (type === 'confirm') {
                    resolve(false);
                } else if (type === 'prompt') {
                    resolve({ value: inputEl?.value || '', response: 2 });
                } else if (type === 'menu') {
                    resolve(-1);
                }
                destroyDialogWithCleanup();
            }, duration);
        }

        // 更新点击遮罩层关闭
        mask.addEventListener('click', e => {
            if (e.target === mask) {
                if (type === 'confirm') resolve(false);
                else if (type === 'prompt') resolve({ value: inputEl?.value || '', response: 0 });
                else if (type === 'menu') resolve(-1);
                destroyDialogWithCleanup();
            }
        });

        // 更新按钮点击事件
        if (type !== 'menu' || needComfirm) {
            const leftBtn = document.createElement('button');
            // ... 左按钮代码 ...
            leftBtn.addEventListener('click', leftBtnClickHandler);

            const rightBtn = document.createElement('button');
            // ... 右按钮代码 ...
            rightBtn.addEventListener('click', rightBtnClickHandler);
        }
    });
};

// 最终导出的 Msg 对象
const Msg = {
    // 原有消息方法（完全保留，未做任何修改）
    success(text: string, duration = 2000, isBlock = false) {
        this._showBasicMsg(text, duration, isBlock, {
            bgColor: 'var(--secondary-warm-1)',
            icon: '✓',
        });
    },
    notice(text: string, duration = 2000, isBlock = false) {
        this._showBasicMsg(text, duration, isBlock, {
            bgColor: 'var(--secondary-cool)',
            icon: 'i',
        });
    },
    warn(text: string, duration = 2000, isBlock = false) {
        this._showBasicMsg(text, duration, isBlock, { bgColor: 'var(--primary)', icon: '!' });
    },
    error(text: string, duration = 2000, isBlock = false) {
        this._showBasicMsg(text, duration, isBlock, {
            bgColor: 'var(--secondary-warm-2)',
            icon: '×',
        });
    },

    // 基础消息弹窗（完全保留，未做任何修改）
    _showBasicMsg(
        text: string,
        duration = 2000,
        isBlock = false,
        typeConfig: { bgColor: string; icon: string }
    ) {
        if (isBlock) {
            const mask = document.createElement('div');
            Object.assign(mask.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.4)',
                zIndex: '9998',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            });
            const msgBox = document.createElement('div');
            Object.assign(msgBox.style, {
                padding: '12px 20px',
                borderRadius: '6px',
                background: typeConfig.bgColor,
                color: '#fff',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
            });
            msgBox.innerHTML = `<span>${typeConfig.icon}</span>${text}`;
            mask.appendChild(msgBox);
            document.body.appendChild(mask);
            setTimeout(() => mask.remove(), duration);
            mask.onclick = () => mask.remove();
        } else {
            const msgBox = document.createElement('div');
            Object.assign(msgBox.style, {
                position: 'fixed',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '8px 16px',
                borderRadius: '4px',
                background: typeConfig.bgColor,
                color: '#fff',
                fontSize: '13px',
                zIndex: '9999',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
            });
            msgBox.innerHTML = `<span>${typeConfig.icon}</span>${text}`;
            document.body.appendChild(msgBox);
            setTimeout(() => msgBox.remove(), duration);
        }
    },

    /**
     * 确认弹窗（阻塞式）
     * @param text 提示文本
     * @param duration 超时时间（ms），<=0 不超时
     * @param leftBtnText 左按钮文本（默认 Cancel）
     * @param rightBtnText 右按钮文本（默认 Confirm）
     * @returns Promise<boolean> - true=确认，false=取消/超时
     */
    confirm(
        text: string,
        duration: number = 0,
        leftBtnText = 'Cancel',
        rightBtnText = 'Confirm'
    ): Promise<boolean> {
        return createBlockDialog(
            'confirm',
            text,
            duration,
            leftBtnText,
            rightBtnText
        ) as Promise<boolean>;
    },

    /**
     * 输入弹窗（阻塞式）
     * @param text 提示文本
     * @param duration 超时时间（ms），<=0 不超时
     * @param leftBtnText 左按钮文本（默认 Cancel）
     * @param rightBtnText 右按钮文本（默认 Confirm）
     * @returns Promise<PromptResult> - value=输入内容，response=0(取消)/1(确认)/2(超时)
     */
    prompt(
        text: string,
        duration: number = 0,
        leftBtnText = 'Cancel',
        rightBtnText = 'Confirm'
    ): Promise<PromptResult> {
        return createBlockDialog(
            'prompt',
            text,
            duration,
            leftBtnText,
            rightBtnText
        ) as Promise<PromptResult>;
    },

    /**
     * 【新增】菜单选择弹窗（阻塞式）
     * @param texts 菜单项数组（必填，为空直接返回-1）
     * @param title 弹窗标题（可选，null/undefined则不显示标题）
     * @param duration 超时时间（ms），<=0 无限等待（默认0）
     * @param needComfirm 是否需要确认/取消按钮（默认false，不显示按钮）
     * @returns Promise<number> - 选中的菜单项索引（从0开始），取消/超时/未选中返回-1
     */
    menu(
        texts: string[],
        title?: string,
        duration: number = 0,
        needComfirm: boolean = false
    ): Promise<number> {
        return createBlockDialog(
            'menu',
            '',
            duration,
            'Cancel',
            'Confirm',
            texts,
            title,
            needComfirm
        ) as Promise<number>;
    },
};

export default Msg;
export type { PromptResult };
