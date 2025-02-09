
export class AxisCalculator {
    /**
     * 计算刻度值
     * @param min 最小值
     * @param max 最大值
     * @param tickCount 期望的刻度数量
     * @param forceIncludeZero 是否强制包含 0
     * @returns 刻度值数组
     */
    public calculateTicks(
        min: number,
        max: number,
        tickCount: number = 5,
        forceIncludeZero: boolean = true
    ): number[] {
        if (min === max) {
            return [min];
        }

        // 如果需要强制包含 0，调整 min 和 max
        if (forceIncludeZero) {
            min = Math.min(min, 0);
            max = Math.max(max, 0);
        }

        // 计算合适的刻度间隔
        const interval = this.calculateNiceInterval(min, max, tickCount);

        // 计算刻度值的起始点和结束点
        const start = Math.floor(min / interval) * interval;
        const end = Math.ceil(max / interval) * interval;

        // 生成刻度值
        const ticks: number[] = [];
        for (let value = start; value <= end + interval * 0.5; value += interval) {
            ticks.push(value);
        }

        return ticks;
    }

    /**
     * 计算合适的刻度间隔
     * @param min 最小值
     * @param max 最大值
     * @param tickCount 期望的刻度数量
     * @returns 刻度间隔
     */
    private calculateNiceInterval(min: number, max: number, tickCount: number): number {
        const range = max - min;

        // 初始间隔
        let interval = range / tickCount;

        // 计算间隔的指数部分
        const exponent = Math.floor(Math.log10(interval));
        const fraction = interval / Math.pow(10, exponent);

        // 常见的“漂亮”间隔
        const niceFractions = [1, 2, 5, 10];
        let niceFraction = niceFractions[0]; // 默认选择最小的间隔

        // 找到最接近的“漂亮”间隔
        for (const f of niceFractions) {
            if (fraction <= f) {
                niceFraction = f;
                break;
            }
        }

        // 计算最终的间隔
        interval = niceFraction * Math.pow(10, exponent);

        return interval;
    }

    /**
     * 格式化刻度标签
     * @param value 刻度值
     * @param precision 小数位数
     * @returns 格式化后的标签
     */
    public formatLabel(value: number, precision: number = 2): string {
        return value.toFixed(precision);
    }
}

