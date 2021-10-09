import reactRefresh from '@vitejs/plugin-react-refresh'
import mdx from 'vite-plugin-mdx'
import { remarkMdxFrontmatter } from 'remark-mdx-frontmatter';

// `options` are passed to `@mdx-js/mdx`
const options = {
  // See https://mdxjs.com/advanced/plugins
  remarkPlugins: [
    require('remark-frontmatter'),
    remarkMdxFrontmatter,
    require('remark-prism'),
  ],
  rehypePlugins: [],
}

export default {
  plugins: [
    reactRefresh(),
    mdx(options),
  ]
}
