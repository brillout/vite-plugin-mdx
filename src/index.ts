import { Plugin } from 'vite'
import * as remarkFrontmatter from 'remark-frontmatter'
import { stopService, transform } from './transform'
import { verifyPeerDependencies } from './verifyPeerDependencies'

export default createPlugin

verifyPeerDependencies()

function createPlugin(mdxOptions?: any): Plugin {
  mdxOptions = mdxOptions || {}
  mdxOptions.remarkPlugins = mdxOptions.remarkPlugins || []
  mdxOptions.remarkPlugins.unshift(remarkFrontmatter)

  return {
    name: 'vite-plugin-mdx',
    transform(code_mdx: string, id: string, ssr?: boolean) {
      if (!/\.mdx?$/.test(id)) {
        return
      }
      return transform({ code_mdx, mdxOptions, ssr })
    },
    async closeBundle() {
      await stopService()
    }
  }
}
