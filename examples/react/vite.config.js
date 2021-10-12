import reactRefresh from '@vitejs/plugin-react-refresh'
import mdx from 'vite-plugin-mdx'

// `options` are passed to `@mdx-js/mdx`
const options = {
  // See https://mdxjs.com/advanced/plugins
  remarkPlugins: [
    require('remark-frontmatter'),
    require('remark-mdx-frontmatter').remarkMdxFrontmatter,
  ],
  rehypePlugins: [],
}

export default {
  plugins: [
    reactRefresh(),
    mdx(options),
  ]
}
