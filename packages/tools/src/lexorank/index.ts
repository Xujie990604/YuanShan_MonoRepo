import { LexoRank } from 'lexorank';

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
export function getRankBetween(prev: string | null, next: string | null): string {
  if (prev === null && next === null) {
    // 第一个元素，返回中间值
    return LexoRank.middle().toString();
  }

  if (prev === null) {
    // 插入到最前面
    const nextRank = LexoRank.parse(next!);
    return nextRank.genPrev().toString();
  }

  if (next === null) {
    // 插入到最后面
    const prevRank = LexoRank.parse(prev);
    return prevRank.genNext().toString();
  }

  // 插入到中间
  const prevRank = LexoRank.parse(prev);
  const nextRank = LexoRank.parse(next);
  return prevRank.between(nextRank).toString();
}

/**
 * 生成初始排序值（用于第一个任务）
 * @returns 初始排序值（字符串）
 */
export function getInitialRank(): string {
  return LexoRank.middle().toString();
}
