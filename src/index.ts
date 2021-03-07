import { Plugin } from 'vite'
import mdx from '@mdx-js/mdx'
import { stopService, transform } from './transform'

export default createPlugin

function createPlugin(mdxOptions?: mdx.Options): Plugin {
  return {
    name: 'vite-plugin-mdx',
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
