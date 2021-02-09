<template>
  <MDXProvider v-bind:components="mdxComponents">
    <Content />
  </MDXProvider>
</template>

<script>
import {MDXProvider} from '@mdx-js/vue'
import box from './Box.vue'
import Content from './Content.mdx'

console.log('b', box);

export default {
  name: 'app',
  components: {box, Content, MDXProvider},
  data() {
    return {
      mdxComponents: {box}
    }
  }
}
</script>
