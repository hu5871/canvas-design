


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


export function minBy(data:number[],target:number){
  return data.reduce((prev, curr) => {
    return (Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev);
  });
}


export  function sortedIndex(array:number[], value:number) {
  let low = 0;
  let high = array.length;

  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (array[mid] < value) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  return low;
}

//返回最大值的索引
export function findMaxIndex(arr:number[]) {
  return arr.reduce(
      (acc, curr, index) => (curr > acc.max ? { max: curr, index } : acc),
      { max: -Infinity, index: -1 }
  ).index;
}