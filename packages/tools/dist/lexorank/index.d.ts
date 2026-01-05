/**
 * Lexorank 工具函数
 * 封装 lexorank 包的使用，用于前后端统一计算排序值
 */
/**
 * 获取两个排序值之间的中间值
 * @param prev 前一个排序值（字符串或 null）
 * @param next 后一个排序值（字符串或 null）
 * @returns 中间排序值（字符串）
 */
export declare function getRankBetween(prev: string | null, next: string | null): string;
/**
 * 生成初始排序值（用于第一个任务）
 * @returns 初始排序值（字符串）
 */
export declare function getInitialRank(): string;
//# sourceMappingURL=index.d.ts.map