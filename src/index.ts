import { Plugin } from 'vite'
import mdx from '@mdx-js/mdx'
import { stopService, transform } from './transform'

export default createPlugin

function createPlugin(mdxOptions?: mdx.Options): Plugin {
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
