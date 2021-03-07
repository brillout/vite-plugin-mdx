import { Plugin } from 'vite'
import { stopService, transform } from './transform'

export default createPlugin

function createPlugin(mdxOptions?: any): Plugin {
  return {
    name: 'vite-plugin-mdx',
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
