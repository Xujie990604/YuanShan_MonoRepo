'use strict';

var lexorank = require('lexorank');

/**
 * 工具函数
 * @param num1 数字1
 * @param num2 数字2
 * @returns 相加的结果
 */
function add(num1, num2) {
    return num1 + num2;
}

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
function getRankBetween(prev, next) {
    if (prev === null && next === null) {
        // 第一个元素，返回中间值
        return lexorank.LexoRank.middle().toString();
    }
    if (prev === null) {
        // 插入到最前面
        const nextRank = lexorank.LexoRank.parse(next);
        return nextRank.genPrev().toString();
    }
    if (next === null) {
        // 插入到最后面
        const prevRank = lexorank.LexoRank.parse(prev);
        return prevRank.genNext().toString();
    }
    // 插入到中间
    const prevRank = lexorank.LexoRank.parse(prev);
    const nextRank = lexorank.LexoRank.parse(next);
    return prevRank.between(nextRank).toString();
}
/**
 * 生成初始排序值（用于第一个任务）
 * @returns 初始排序值（字符串）
 */
function getInitialRank() {
    return lexorank.LexoRank.middle().toString();
}

exports.add = add;
exports.getInitialRank = getInitialRank;
exports.getRankBetween = getRankBetween;
//# sourceMappingURL=bundle.cjs.map
