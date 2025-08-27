declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    YInput: typeof import('./components/input/input.vue').default
  }
}