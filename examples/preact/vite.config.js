import prefresh from '@prefresh/vite'
import mdx from 'vite-plugin-mdx'

// `options` are passed to `@mdx-js/mdx`
const options = {
  // See https://mdxjs.com/advanced/plugins
  remarkPlugins: [
    require('remark-prism')
  ],
  rehypePlugins: [],
}

export default {
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: `import { h, Fragment } from 'preact'`
  },
  plugins: [
    prefresh(),
    mdx(options)
  ]
}
