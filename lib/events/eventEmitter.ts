// 定义事件映射类型
type EventMap = Record<string | symbol, (...arg: any[])=>void>;


export default class EventEmitter<T extends EventMap> {
  // 使用 Map 存储事件名和监听器集合
  private eventMap:  Map<keyof T, Set<T[keyof T]>>= new Map();

  /**
   * 注册事件监听器
   * @param eventName - 事件名称
   * @param listener - 事件监听器函数
   * @returns 当前 EventEmitter 实例
   */
  on<K extends keyof T>(eventName: K, listener: T[K]): this {
    // 如果事件不存在于事件映射中，则初始化一个新的 Set
    if (!this.eventMap.has(eventName)) {
      this.eventMap.set(eventName, new Set());
    }
    // 添加监听器到事件的 Set 中
    this.eventMap.get(eventName)!.add(listener);
    return this;
  }

  /**
   * 触发事件
   * @param eventName - 事件名称
   * @param args - 传递给监听器的参数
   * @returns 是否有监听器被触发
   */
  emit<K extends keyof T>(eventName: K, ...args: Parameters<T[K]>): boolean {
    // 获取事件的监听器集合
    const listeners = this.eventMap.get(eventName);
    // 如果没有监听器，返回 false
    if (!listeners || listeners.size === 0) return false;
    // 依次调用所有监听器
    listeners.forEach((listener) => {
      listener(...args);
    });
    return true;
  }

  /**
   * 移除事件监听器
   * @param eventName - 事件名称
   * @param listener - 事件监听器函数
   * @returns 当前 EventEmitter 实例
   */
  off<K extends keyof T>(eventName: K, listener: T[K]): this {
    // 获取事件的监听器集合
    const listeners = this.eventMap.get(eventName);
    if (listeners) {
      // 从 Set 中删除监听器
      listeners.delete(listener);
      // 如果 Set 为空，则从事件映射中删除该事件
      if (listeners.size === 0) {
        this.eventMap.delete(eventName);
      }
    }
    return this;
  }
}
