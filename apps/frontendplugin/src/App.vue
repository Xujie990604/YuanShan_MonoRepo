<template>
  <div id="app">
    <ServerList />
  </div>
</template>

<script>
import ServerList from './components/ServerList.vue'

export default {
  name: 'App',
  components: {
    ServerList
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #f5f5f5;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  padding: 10px;
}
</style>
