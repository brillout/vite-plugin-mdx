import { Plugin as VitePlugin } from 'vite'
import mdx from '@mdx-js/mdx'
import type { Plugin as UnifiedPlugin } from 'unified'
import { stopService, transform } from './transform'

export default createPlugin

export interface MdxPlugin extends VitePlugin {
  mdxOptions: mdx.Options & {
    remarkPlugins: UnifiedPlugin[]
    rehypePlugins: UnifiedPlugin[]
  }
}

function createPlugin(mdxOptions: mdx.Options = {}): MdxPlugin {
  mdxOptions.remarkPlugins ??= []
  mdxOptions.rehypePlugins ??= []

  return {
    name: 'vite-plugin-mdx',
    mdxOptions: mdxOptions as any,
    configResolved(config) {
      const reactRefresh = config.plugins.find(
        (p) => p.name === 'react-refresh'
      )
      this.transform = async function (code, id, ssr) {
        if (/\.mdx?$/.test(id)) {
          code = await transform(code, mdxOptions, ssr, config.root)
          const refreshResult = await reactRefresh?.transform!.call(
            this,
            code,
            id + '.js',
            ssr
          )
          return refreshResult || code
        }
      }
    },
    async closeBundle() {
      await stopService()
    }
  }
}
