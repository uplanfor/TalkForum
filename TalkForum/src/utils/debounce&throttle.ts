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
  let timeout: number | null = null; // 浏览器定时器ID为number

  const throttled = function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    // 只有定时器为空时，才执行下一次（保证间隔wait毫秒）
    if (timeout === null) {
      timeout = window.setTimeout(() => {
        func.apply(this, args); // 绑定this和事件参数
        timeout = null; // 执行后清空定时器，允许下次触发
      }, wait);
    }
  } as T & { cancel: () => void };

  // 新增：取消未执行的节流函数
  throttled.cancel = function () {
    if (timeout !== null) {
      window.clearTimeout(timeout);
      timeout = null;
    }
  };

  return throttled;
}
