/**
 * 浏览器环境防抖函数（Debounce）
 * 场景：搜索输入、按钮防重复点击、窗口resize等（触发后延迟执行，重复触发重置延迟）
 * @param func 要防抖的函数（支持浏览器事件回调，如 (e: Event) => void）
 * @param wait 延迟时间（毫秒）
 * @returns 防抖后的函数 + cancel方法（取消未执行的函数）
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): T & { cancel: () => void } {
    let timeout: number | null = null; // 浏览器环境：定时器ID是number类型（Node.js是Timeout对象）

    // 用普通函数绑定this（浏览器事件回调中this指向事件触发者，如window、DOM元素）
    const debounced = function (this: ThisParameterType<T>, ...args: Parameters<T>) {
        // 重置延迟：每次触发都清空之前的定时器
        if (timeout !== null) {
            window.clearTimeout(timeout); // 浏览器环境显式调用window.clearTimeout（更严谨）
        }

        // 延迟执行函数：绑定事件回调的this（比如scroll事件中this是window）
        timeout = window.setTimeout(() => {
            timeout = null; // 已执行，清空定时器ID，避免残留导致误判
            func.apply(this, args); // 传递正确的this和事件参数（如Event对象）
        }, wait);
    } as T & { cancel: () => void };

    // 新增：取消未执行的防抖函数（避免浏览器内存泄漏，比如组件卸载/事件解绑时）
    debounced.cancel = function () {
        if (timeout !== null) {
            window.clearTimeout(timeout);
            timeout = null;
        }
    };

    return debounced;
}

/**
 * 浏览器环境节流函数（Throttle）
 * 场景：滚动加载、触摸事件、鼠标移动等（固定间隔内只执行一次）
 * @param func 要节流的函数（支持浏览器事件回调）
 * @param wait 间隔时间（毫秒）
 * @returns 节流后的函数 + cancel方法
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): T & { cancel: () => void } {
    let timeout: number | null = null;
    let lastExecTime: number = 0;

    const throttled = function (this: ThisParameterType<T>, ...args: Parameters<T>) {
        const now = Date.now();
        const timeSinceLastExec = now - lastExecTime;
        const timeToWait = wait - timeSinceLastExec;

        const execute = () => {
            lastExecTime = Date.now(); // 使用执行时刻作为最后执行时间，避免调度时使用过期的`now`
            try {
                func.apply(this, args);
            } finally {
                // 如果是由定时器触发的执行，确保清空 timeout 标识
                timeout = null;
            }
        };

        if (timeout !== null) {
            window.clearTimeout(timeout);
            timeout = null;
        }

        if (timeSinceLastExec >= wait) {
            // 超过等待时间，立即执行
            execute();
        } else {
            // 设置定时器，在剩余时间后执行
            timeout = window.setTimeout(execute, timeToWait);
        }
    } as T & { cancel: () => void };

    throttled.cancel = function () {
        if (timeout !== null) {
            window.clearTimeout(timeout);
            timeout = null;
        }
    };

    return throttled;
}
