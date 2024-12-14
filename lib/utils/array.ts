


export function flattenArray<T, K extends keyof T>(
  arr: T[],
  childKey: K
): T[] {
  const stack: T[] = [...arr];
  const result: T[] = [];

  while (stack.length > 0) {
    const node = stack.pop()!;
    result.push(node);

    const children = node[childKey];
    if (Array.isArray(children)) {
      stack.push(...children);
    }
  }

  return result.reverse(); // 因为栈是后进先出，需要反转结果
}