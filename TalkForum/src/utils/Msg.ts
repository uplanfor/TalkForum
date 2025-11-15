interface MsgCacheItem {
  count: number;
  duration: number;
  element: HTMLDivElement;
  timer?: number;
}

interface MsgState {
  queue: Array<{ text: string; duration?: number; typeConfig: TypeConfig }>;
  currentCount: number;
  maxCount: number;
  blockInstance: BlockInstance | null;
  nonBlockClass: string;
  cache: Record<string, MsgCacheItem>;
}

interface NonBlockMsgData {
  text: string;
  duration?: number;
  typeConfig: TypeConfig;
}

interface BlockInstance {
  mask: HTMLDivElement;
  msgBox: HTMLDivElement;
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

const Msg = {
  /**
   * 处理非阻塞消息队列：取出队首消息并显示
   */
  _processQueue(this: typeof Msg): void {
    if (msgState.currentCount < msgState.maxCount && msgState.queue.length > 0) {
      const nextMsg = msgState.queue.shift();
      if (nextMsg) {
        msgState.currentCount++;
        this._createNonBlockMsg(nextMsg);
        this._adjustNonBlockPositions();
      }
    }
  },

  /**
   * 调整所有非阻塞消息位置：前面消息消失后自动上移补位
   */
  _adjustNonBlockPositions(this: typeof Msg): void {
    const nonBlockMsgs = document.querySelectorAll<HTMLDivElement>(`.${msgState.nonBlockClass}`);
    nonBlockMsgs.forEach((msgBox, index) => {
      const baseTop = 15;
      const itemGap = 36;
      msgBox.style.top = `${baseTop + index * itemGap}px`;
    });
  },

  /**
   * 创建非阻塞消息
   */
  _createNonBlockMsg(this: typeof Msg, { text, duration, typeConfig }: NonBlockMsgData, key: string): void {
    const msgText = text || "未传入消息内容";
    const showDuration = duration && duration >= 1000 ? duration : 1000;

    // 检查是否已有相同消息且元素仍在DOM中
    if (msgState.cache[key] && msgState.cache[key].blockElement && 
        document.body.contains(msgState.cache[key].blockElement.mask)) {
      const cachedMsg = msgState.cache[key];
      cachedMsg.count++;
      cachedMsg.duration = Math.max(cachedMsg.duration, showDuration);
      
      // 更新计数显示
      let countEl = cachedMsg.element.querySelector('.msg-count');
      if (!countEl) {
        countEl = document.createElement('span');
        countEl.className = 'msg-count';
        Object.assign(countEl.style, {
          position: "absolute",
          top: "-12px",
          left: "-12px",
          fontSize: "16px",
          backgroundColor: "#ff4757",
          color: "white",
          fontWeight: "bold",
          borderRadius: "50%",
          width: "28px",
          height: "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: "10001",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          border: "2px solid white"
        });
        cachedMsg.element.style.position = "relative";
        cachedMsg.element.appendChild(countEl);
      }
      countEl.textContent = cachedMsg.count > 1 ? cachedMsg.count.toString() : "";

      // 重置计时器
      if (cachedMsg.timer) {
        clearTimeout(cachedMsg.timer);
      }
      cachedMsg.timer = setTimeout(() => this._removeNonBlockMsg(cachedMsg.element, key), cachedMsg.duration);
      return;
    }

    const msgBox = document.createElement("div");
    msgBox.classList.add(msgState.nonBlockClass);
    Object.assign(msgBox.style, {
      padding: "8px 16px",
      borderRadius: "4px",
      backgroundColor: typeConfig.bgColor,
      color: "#fff",
      fontSize: "13px",
      fontWeight: "400",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      zIndex: "9999",
      transition: "opacity 0.2s ease, transform 0.2s ease, top 0.2s ease",
      position: "fixed",
      top: "0",
      left: "50%",
      transform: "translateX(-50%)",
      boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
      cursor: "pointer",
      userSelect: "none",
      opacity: "1"
    });

    const icon = document.createElement("span");
    icon.textContent = typeConfig.icon;
    icon.style.fontSize = "14px";
    const textNode = document.createTextNode(msgText);
    msgBox.appendChild(icon);
    msgBox.appendChild(textNode);

    document.body.appendChild(msgBox);
    const timer = setTimeout(() => this._removeNonBlockMsg(msgBox, key), showDuration);
    
    // 存入缓存
    msgState.cache[key] = {
      count: 1,
      duration: showDuration,
      element: msgBox,
      timer
    };
  },

  /**
   * 移除非阻塞消息
   */
  _removeNonBlockMsg(this: typeof Msg, msgBox: HTMLDivElement, key: string): void {
    msgBox.style.opacity = "0";
    msgBox.style.transform = "translateX(-50%) translateY(-8px)";
    setTimeout(() => {
      msgBox.remove();
      msgState.currentCount--;
      delete msgState.cache[key];
      this._adjustNonBlockPositions();
      this._processQueue();
    }, 200);
  },

  /**
   * 创建阻塞消息
   */
  _createBlockMsg(this: typeof Msg, methodName: string, text: string, duration?: number, typeConfig: TypeConfig, key: string): void {
    if (msgState.blockInstance) {
      msgState.blockInstance.mask.remove();
      msgState.blockInstance.msgBox.remove();
    }

    const msgText = text || "未传入消息内容";
    const showDuration = duration && duration >= 1000 ? duration : 1000;

    const mask = document.createElement("div");
    Object.assign(mask.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.4)",
      zIndex: "9998",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    });

    const msgBox = document.createElement("div");
    Object.assign(msgBox.style, {
      padding: "12px 20px",
      borderRadius: "6px",
      backgroundColor: typeConfig.bgColor,
      color: "#fff",
      fontSize: "13px",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      zIndex: "9999",
      transition: "opacity 0.2s ease"
    });

    const icon = document.createElement("span");
    icon.textContent = typeConfig.icon;
    icon.style.fontSize = "14px";
    const textNode = document.createTextNode(msgText);
    msgBox.appendChild(icon);
    msgBox.appendChild(textNode);

    mask.appendChild(msgBox);
    document.body.appendChild(mask);
    msgState.blockInstance = { mask, msgBox };
    // 检查是否已有相同消息
    if (msgState.cache[key]) {
      const cachedMsg = msgState.cache[key];
      cachedMsg.count++;
      cachedMsg.duration = Math.max(cachedMsg.duration, showDuration);
      
      // 更新计数显示
      let countEl = cachedMsg.blockElement.msgBox.querySelector('.msg-count');
      if (!countEl) {
        countEl = document.createElement('span');
        countEl.className = 'msg-count';
        Object.assign(countEl.style, {
          position: "absolute",
          top: "-12px",
          left: "-12px",
          fontSize: "16px",
          backgroundColor: "#ff4757",
          color: "white",
          fontWeight: "bold",
          borderRadius: "50%",
          width: "28px",
          height: "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: "10001",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          border: "2px solid white"
        });
        cachedMsg.blockElement.msgBox.style.position = "relative";
        cachedMsg.blockElement.msgBox.appendChild(countEl);
      }
      countEl.textContent = cachedMsg.count > 1 ? cachedMsg.count.toString() : "";

      // 重置计时器
      if (cachedMsg.blockTimer) {
        clearTimeout(cachedMsg.blockTimer);
      }
      cachedMsg.blockTimer = setTimeout(() => this._removeBlockMsg(key), cachedMsg.duration);
      return;
    }

    mask.onclick = () => this._removeBlockMsg(key);
    const blockTimer = setTimeout(() => this._removeBlockMsg(key), showDuration);
    
    // 存入缓存
    msgState.cache[key] = {
      count: 1,
      duration: showDuration,
      isBlock: true,
      blockElement: { mask, msgBox },
      blockTimer
    };
  },

  /**
   * 移除阻塞消息
   */
  _removeBlockMsg(this: typeof Msg, key: string): void {
    if (!msgState.blockInstance || !msgState.cache[key]) return;
    const { mask, msgBox } = msgState.blockInstance;
    msgBox.style.opacity = "0";
    mask.style.backgroundColor = "rgba(0,0,0,0)";
    setTimeout(() => {
      mask.remove();
      msgBox.remove();
      msgState.blockInstance = null;
      delete msgState.cache[key];
    }, 200);
  },

  /**
   * 统一消息入口
   */
  _showMsg(this: typeof Msg, methodName: string, text: string, duration?: number, is_block?: boolean, typeConfig: TypeConfig): void {
    const key = `${methodName}_${text}`; // 使用方法名和文本作为唯一标识
    
    if (is_block === true) {
      this._createBlockMsg(methodName, text, duration, typeConfig, key);
    } else {
      const msgData: NonBlockMsgData = { text, duration, typeConfig };
      if (msgState.currentCount < msgState.maxCount) {
        msgState.currentCount++;
        this._createNonBlockMsg(msgData, key);
        this._adjustNonBlockPositions();
      } else {
        msgState.queue.push(msgData);
      }
    }
  },

  // 1. 成功消息（绿色）
  success(text: string, duration?: number, is_block?: boolean): void {
    this._showMsg('success', text, duration, is_block, { bgColor: "#10b981", icon: "✓" });
  },

  // 2. 通知消息（蓝色）
  notice(text: string, duration?: number, is_block?: boolean): void {
    this._showMsg('notice', text, duration, is_block, { bgColor: "#3b82f6", icon: "i" });
  },

  // 3. 警告消息（橙色）
  warn(text: string, duration?: number, is_block?: boolean): void {
    this._showMsg('warn', text, duration, is_block, { bgColor: "#f59e0b", icon: "!" });
  },

  // 4. 错误消息（红色）
  error(text: string, duration?: number, is_block?: boolean): void {
    this._showMsg('error', text, duration, is_block, { bgColor: "#ef4444", icon: "×" });
  }
};

export default Msg;
