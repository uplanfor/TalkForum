// 定义 Prompt 返回值类型
interface PromptResult {
  value: string;    // 输入框内容
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
  resolve?: (value: boolean | PromptResult) => void;
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
  nonBlockClass: "msg-non-block",
  cache: {}
};

/**
 * 通用创建阻塞弹窗方法（内部复用）
 * @param type - confirm/prompt
 * @param text - 提示文本
 * @param duration - 超时时间（ms），<=0 则不超时
 * @param leftBtnText - 左按钮文本
 * @param rightBtnText - 右按钮文本
 * @returns Promise 封装结果
 */
const createBlockDialog = (
  type: 'confirm' | 'prompt',
  text: string,
  duration: number,
  leftBtnText: string,
  rightBtnText: string
): Promise<boolean | PromptResult> => {
  return new Promise((resolve) => {
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

    // 3. 提示文本（使用CSS变量配色 | 响应式行高）
    const textEl = document.createElement('div');
    textEl.textContent = text || '请确认操作';
    Object.assign(textEl.style, {
      fontSize: '14px',
      color: 'var(--neutral-text-main)', // 主文本色
      lineHeight: '1.6', // 响应式行高，提升可读性
      wordBreak: 'break-word', // 长文本换行
    });
    dialog.appendChild(textEl);

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

    // 5. 按钮容器（响应式布局）
    const btnContainer = document.createElement('div');
    Object.assign(btnContainer.style, {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      marginTop: '8px',
      width: '100%', // 响应式宽度
      boxSizing: 'border-box', // 盒模型适配
    });

    // 6. 按钮通用样式（响应式）
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

    // 7. 左按钮（取消）- 使用CSS变量配色
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
      } else {
        resolve({ value: inputEl?.value || '', response: 0 }); // 取消返回 response=0
      }
      destroyDialog();
    });
    btnContainer.appendChild(leftBtn);

    // 8. 右按钮（确认）- 使用CSS变量配色
    const rightBtn = document.createElement('button');
    rightBtn.textContent = rightBtnText || 'Confirm';
    Object.assign(rightBtn.style, btnStyle, {
      backgroundColor: 'var(--secondary-cool)', // 确认按钮背景
      color: '#fff', // 白色文本（无对应变量，保留）
      zIndex: '4097', // 按钮层级
    });
    rightBtn.addEventListener('mouseenter', () => {
      rightBtn.style.backgroundColor = 'var(--primary)'; // hover背景
    });
    rightBtn.addEventListener('mouseleave', () => {
      rightBtn.style.backgroundColor = 'var(--secondary-cool)'; // 恢复背景
    });
    rightBtn.addEventListener('click', () => {
      if (type === 'confirm') {
        resolve(true); // 确认返回 true
      } else {
        resolve({ value: inputEl?.value || '', response: 1 }); // 确认返回 response=1
      }
      destroyDialog();
    });
    btnContainer.appendChild(rightBtn);

    dialog.appendChild(btnContainer);
    mask.appendChild(dialog);
    document.body.appendChild(mask);

    // 9. 超时处理
    let timeoutTimer: number | null = null;
    if (duration > 0) {
      timeoutTimer = window.setTimeout(() => {
        if (type === 'confirm') {
          resolve(false); // 超时默认返回 false
        } else {
          resolve({ value: inputEl?.value || '', response: 2 }); // 超时返回 response=2
        }
        destroyDialog();
      }, duration);
    }

    // 10. 销毁弹窗（通用方法）
    function destroyDialog() {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      mask.remove();
      dialog.remove();
    }

    // 11. 点击遮罩层关闭（可选）
    mask.addEventListener('click', (e) => {
      if (e.target === mask) {
        if (type === 'confirm') resolve(false);
        else resolve({ value: inputEl?.value || '', response: 0 });
        destroyDialog();
      }
    });

    // 响应式适配：窗口大小变化时重新调整弹窗位置
    const resizeHandler = () => {
      dialog.style.maxWidth = '90vw'; // 极端小屏时占90%视口宽度
    };
    window.addEventListener('resize', resizeHandler);
    // 销毁时移除监听
    destroyDialog = (() => {
      const originalDestroy = destroyDialog;
      return () => {
        window.removeEventListener('resize', resizeHandler);
        originalDestroy();
      };
    })();
  });
};

// 最终导出的 Msg 对象
const Msg = {
  // 原有消息方法（完全保留，未做任何修改）
  success(text: string, duration = 2000, isBlock = false) {
    this._showBasicMsg(text, duration, isBlock, { bgColor: "#0feda3ff", icon: "✓" });
  },
  notice(text: string, duration = 2000, isBlock = false) {
    this._showBasicMsg(text, duration, isBlock, { bgColor: "#75fdffff", icon: "i" });
  },
  warn(text: string, duration = 2000, isBlock = false) {
    this._showBasicMsg(text, duration, isBlock, { bgColor: "#e8e508ff", icon: "!" });
  },
  error(text: string, duration = 2000, isBlock = false) {
    this._showBasicMsg(text, duration, isBlock, { bgColor: "#f32525ff", icon: "×" });
  },

  // 基础消息弹窗（完全保留，未做任何修改）
  _showBasicMsg(text: string, duration = 2000, isBlock = false, typeConfig: { bgColor: string; icon: string }) {
    if (isBlock) {
      const mask = document.createElement('div');
      Object.assign(mask.style, {
        position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.4)', zIndex: '9998', display: 'flex',
        alignItems: 'center', justifyContent: 'center'
      });
      const msgBox = document.createElement('div');
      Object.assign(msgBox.style, {
        padding: '12px 20px', borderRadius: '6px', background: typeConfig.bgColor,
        color: '#fff', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px'
      });
      msgBox.innerHTML = `<span>${typeConfig.icon}</span>${text}`;
      mask.appendChild(msgBox);
      document.body.appendChild(mask);
      setTimeout(() => mask.remove(), duration);
      mask.onclick = () => mask.remove();
    } else {
      const msgBox = document.createElement('div');
      Object.assign(msgBox.style, {
        position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
        padding: '8px 16px', borderRadius: '4px', background: typeConfig.bgColor,
        color: '#fff', fontSize: '13px', zIndex: '9999', display: 'flex', alignItems: 'center', gap: '6px'
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
    leftBtnText = "Cancel",
    rightBtnText = "Confirm"
  ): Promise<boolean> {
    return createBlockDialog('confirm', text, duration, leftBtnText, rightBtnText) as Promise<boolean>;
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
    duration: number  = 0,
    leftBtnText = "Cancel",
    rightBtnText = "Confirm"
  ): Promise<PromptResult> {
    return createBlockDialog('prompt', text, duration, leftBtnText, rightBtnText) as Promise<PromptResult>;
  },
};

export default Msg;
export type { PromptResult };