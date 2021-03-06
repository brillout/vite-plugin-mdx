import prefresh from '@prefresh/vite'
import mdx from 'vite-plugin-mdx'

export default {
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: `import { h, Fragment } from 'preact'`
  },
  plugins: [prefresh(), mdx()]
}
