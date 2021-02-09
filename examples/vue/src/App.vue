<template>
  <img alt="Vue logo" src="./assets/logo.png" />
  before
  <!--
  <Hello/>
  -->
  before2
  <MDXProvider v-bind:components="mdxComponents">
    <Content />
  </MDXProvider>
  after
</template>

<script>
import {MDXProvider} from '@mdx-js/vue'
import box from './Box.vue'
import Content from './Content.mdx'
import Hello from './Hello.mdx'

export default {
  name: 'app',
  components: {box, Content, MDXProvider, Hello},
  data() {
    return {
      mdxComponents: {box}
    }
  }
}

// This starter template is using Vue 3 experimental <script setup> SFCs
// Check out https://github.com/vuejs/rfcs/blob/script-setup-2/active-rfcs/0000-script-setup.md
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
