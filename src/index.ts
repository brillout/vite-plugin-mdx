import type { Plugin } from 'vite'
import * as remarkFrontmatter from 'remark-frontmatter'
import { stopService, transformMdx } from './transform'

export function cleanCreatePlugin(mdxOpts?: any): Plugin {
  return {
    name: 'vite-plugin-mdx',
    transform(code: string, id: string, ssr?: boolean) {
      if (!/\.mdx?$/.test(id)) {
        return
      }
      return transformMdx({ code, mdxOpts, ssr })
    },
    async closeBundle() {
      await stopService()
    }
  }
}

export default function createPlugin(_mdxOpts?: any) {
  let remarkPlugins: any[] = _mdxOpts?.remarkPlugins ?? []
  // support frontmatter by default
  remarkPlugins = [remarkFrontmatter, ...remarkPlugins]
  return cleanCreatePlugin({ ..._mdxOpts, remarkPlugins })
}

export { transformMdx }
