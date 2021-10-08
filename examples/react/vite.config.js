import reactRefresh from '@vitejs/plugin-react-refresh'
import mdx from 'vite-plugin-mdx'

// `options` are passed to `@mdx-js/mdx`
const options = {
  // See https://mdxjs.com/advanced/plugins
  remarkPlugins: [
      require('remark-prism'),
      require('remark-frontmatter')
  ],
  rehypePlugins: [],
}

export default {
  plugins: [
    reactRefresh(),
    mdx(options),
  ]
}
