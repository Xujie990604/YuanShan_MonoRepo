import { ref, createElementBlock, openBlock, Fragment, createElementVNode } from 'vue';

const _hoisted_1 = ["placeholder"];



var script = {
  __name: 'input',
  setup(__props) {

const name = ref('input 组件默认提示文字');

return (_ctx, _cache) => {
  return (openBlock(), createElementBlock(Fragment, null, [
    _cache[0] || (_cache[0] = createElementVNode("h1", null, "input组件", -1 /* CACHED */)),
    createElementVNode("input", {
      type: "text",
      placeholder: name.value
    }, null, 8 /* PROPS */, _hoisted_1)
  ], 64 /* STABLE_FRAGMENT */))
}
}

};

script.__scopeId = "data-v-ab535e36";
script.__file = "src/components/input/input.vue";

// 为单个组件添加 install 方法
script.install = (app) => {
    app.component('YInput', script);
};

// 所有组件列表
const components = [script];
// 定义 install 方法，用于整体安装所有组件
const install = (app) => {
    components.forEach(component => {
        if (component.install) {
            app.use(component);
        }
    });
};
// 支持完整引入
var index = {
    install,
    YInput: script
};

export { script as YInput, index as default };
