import { stopService, transform } from './transform'
import { MdxOptions, MdxPlugin } from './types'

export default createPlugin

function createPlugin(
  mdxOptions: MdxOptions | ((filename: string) => MdxOptions) = {}
): MdxPlugin {
  let getMdxOptions: ((filename: string) => MdxOptions) | undefined
  let globalMdxOptions: any = mdxOptions
  if (typeof mdxOptions === 'function') {
    getMdxOptions = mdxOptions
    globalMdxOptions = {}
  }

  // Ensure plugin arrays exist for other Vite plugins to manipulate.
  globalMdxOptions.remarkPlugins ??= []
  globalMdxOptions.rehypePlugins ??= []

  return {
    name: 'vite-plugin-mdx',
    mdxOptions: globalMdxOptions,
    configResolved(config) {
      const reactRefresh = config.plugins.find(
        (p) => p.name === 'react-refresh'
      )
      this.transform = async function (code, id, ssr) {
        if (/\.mdx?$/.test(id)) {
          const mdxOptions = mergeOptions(globalMdxOptions, getMdxOptions?.(id))
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

function mergeOptions(globalOptions: MdxOptions, localOptions?: MdxOptions) {
  if (!localOptions) {
    return globalOptions
  }
  return {
    ...globalOptions,
    ...localOptions,
    remarkPlugins: globalOptions.remarkPlugins!.concat(
      localOptions.remarkPlugins || []
    ),
    rehypePlugins: globalOptions.rehypePlugins!.concat(
      localOptions.rehypePlugins || []
    ),
    compilers: (globalOptions.compilers || []).concat(
      localOptions.compilers || []
    )
  }
}
