import { stopService, transform } from './transform'
import { MdxOptions, MdxPlugin } from './types'

export default createPlugin

function createPlugin(mdxOptions: MdxOptions = {}): MdxPlugin {
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
          code = await transform(code, mdxOptions, config.root)
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
