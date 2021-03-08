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
    configResolved({ plugins }) {
      const reactRefresh = plugins.find((p) => p.name === 'react-refresh')

      this.transform = async function (code_mdx, id, ssr) {
        if (/\.mdx?$/.test(id)) {
          const code = await transform({ code_mdx, mdxOptions, ssr })
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
