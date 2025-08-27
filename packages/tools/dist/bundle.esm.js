function add(num1, num2) {
    console.log('tools子包的add方法');
    return num1 + num2;
}
// TODO： TS 项目如何把方法暴漏出去的同时，把 TS 类型也暴漏出去(1、导出源码，2、导出 commonjs 模块)
// TODO： 工具库这类三方依赖，在导出给其他项目使用时，直接导出源码？还是导出 commonjs 模块？

export { add };
