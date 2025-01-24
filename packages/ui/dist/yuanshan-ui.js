import { ref, openBlock, createElementBlock, createElementVNode } from 'vue';

var script = {
  __name: 'input',
  setup(__props) {

ref('input 组件');

return (_ctx, _cache) => {
  return (openBlock(), createElementBlock("div", null, _cache[0] || (_cache[0] = [
    createElementVNode("input", { type: "text" }, null, -1 /* HOISTED */)
  ])))
}
}

};

script.__file = "src/components/input/input.vue";

// export default function test() {
//   return 'test'
// }
var index = {
    input: script,
};

export { index as default };
