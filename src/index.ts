import { Plugin } from 'vite'
import { stopService, transform } from './transform'

export default createPlugin

function createPlugin(mdxOptions?: any): Plugin {
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
