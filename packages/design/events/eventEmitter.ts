type EventMap = Record<string | symbol, (...args: any[]) => void>;

export default class EventEmitter<T extends EventMap> {
  // 存储结构：事件名 → WeakRef包装的监听器集合
  private eventMap: Map<keyof T, Set<WeakRef<T[keyof T]>>> = new Map();
  
  // 自动清理已被GC的监听器
  private cleanupRegistry = new FinalizationRegistry((heldValue: {
    eventName: keyof T,
    wr: WeakRef<T[keyof T]>
  }) => {
    const { eventName, wr } = heldValue;
    const listeners = this.eventMap.get(eventName);
    if (!listeners) return;

    // 清理无效的WeakRef
    listeners.forEach(item => {
      if (item === wr && !item.deref()) {
        listeners.delete(item);
      }
    });
  });

  //──────────────────────── 核心方法 ────────────────────────//

  /**
   * 注册事件监听器（支持上下文绑定）
   * @param eventName - 事件名
   * @param listener - 监听函数
   * @param context - 绑定this对象（可选）
   */
  on<K extends keyof T>(
    eventName: K,
    listener: T[K],
    context?: unknown
  ): this {
    const boundListener = context ? 
      (listener as Function).bind(context) : 
      listener;

    if (!this.eventMap.has(eventName)) {
      this.eventMap.set(eventName, new Set());
    }

    const wr = new WeakRef(boundListener);
    this.eventMap.get(eventName)!.add(wr);
    this.cleanupRegistry.register(boundListener, { eventName, wr });

    return this;
  }

  /**
   * 触发事件（自动处理WeakRef解引用）
   * @returns 是否有有效监听器被执行
   */
  emit<K extends keyof T>(eventName: K, ...args: Parameters<T[K]>)  {
    const listeners = this.eventMap.get(eventName);
    if (!listeners) return false;

    listeners.forEach(wr => {
      const listener = wr.deref();
      if (listener) {
        try {
          listener(...args as Parameters<T[K]>);
        } catch (err) {
          return console.error(err)
        }
      }
    });

  }

  /**
   * 移除指定监听器
   * @param exactMatch - 是否严格匹配WeakRef（默认false）
   */
  off<K extends keyof T>(
    eventName: K,
    listener: T[K],
    exactMatch = false
  ): this {
    const listeners = this.eventMap.get(eventName);
    if (!listeners) return this;

    // 精确模式：直接删除WeakRef
    if (exactMatch) {
      listeners.forEach(wr => {
        if (wr.deref() === listener) {
          listeners.delete(wr);
        }
      });
    } 
    // 模糊模式：遍历解引用后比较
    else {
      listeners.forEach(wr => {
        if (wr.deref() === listener) {
          listeners.delete(wr);
        }
      });
    }

    if (listeners.size === 0) {
      this.eventMap.delete(eventName);
    }
    return this;
  }

  /**
   * 单次监听（自动解绑）
   */
  once<K extends keyof T>(eventName: K, listener: T[K], context?: unknown): this {
    const wrapper = (...args: Parameters<T[K]>) => {
      const bound = context ? listener.bind(context) : listener;
      bound(...args);
      this.off(eventName, wrapper as T[K]); // 精确匹配
    };
    return this.on(eventName, wrapper as T[K], context);
  }

  /**
   * 清空事件监听
   */
  removeAll<K extends keyof T>(eventName?: K): this {
    if (eventName) {
      this.eventMap.delete(eventName);
    } else {
      this.eventMap.clear();
    }
    return this;
  }
}