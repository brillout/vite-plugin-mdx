import mdx from '@brillout/vite-plugin-mdx/dist/vue'
import {createVuePlugin} from 'vite-plugin-vue2'

export default {
  plugins: [createVuePlugin({jsx: true}), mdx()]
}
