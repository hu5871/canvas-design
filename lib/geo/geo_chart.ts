



// 根据给定的数值范围计算一个合适的 步长和 最大值。
export const getRoundedDomains = (values: number[]): { maxValue: number; stepSize: number } => {
  const maxValue = Math.max(...values);
  //数量级
  const orderOfMagnitude = Math.floor(Math.log10(maxValue / 5));
  const stepSize = 10 * Math.pow(10, orderOfMagnitude);
  return {
    stepSize,
    maxValue: stepSize * 5
  };
};



export function getNumberTicks(
  values: number[],
  range: [number, number]
): { label: string; scale: number,rectPoint:number }[] {
  const { maxValue, stepSize } = getRoundedDomains(values);
  const ticks = [];
  const rangeSpan = range[1] - range[0]
  for (let i = 0; i * stepSize <= maxValue; i += 1) {
    ticks.push(i * stepSize);
  }
  return ticks.map((tick,index) => {
    const percent = values[index] / maxValue; // 计算百分比
     
    return {
      label: `${tick}`,
      scale: range[0] + (rangeSpan) * (tick / maxValue),
      rectPoint:range[0] + (rangeSpan) * percent
    }
    
  });
}


export function getStringTicks(
  values: string[],
  range: [number, number]
){
  const cnt = values.length;
  const step = (range[1] - range[0]) / cnt;
  
  return values.map((val, index) => ({
    label: val as string,
    lineX: range[0] + step * (index + 0.5),
  }));
}




