import { stopService, transform } from './transform'
import { MdxOptions, MdxPlugin } from './types'
import { viteMdxTransclusion } from './viteMdxTransclusion'
import { mergeArrays } from './common'

export { MdxOptions, MdxPlugin }

export default createPlugin

function createPlugin(
  mdxOptions: MdxOptions | ((filename: string) => MdxOptions) = {}
) {
  let getMdxOptions: ((filename: string) => MdxOptions) | undefined
  let globalMdxOptions: any = mdxOptions
  if (typeof mdxOptions === 'function') {
    getMdxOptions = mdxOptions
    globalMdxOptions = {}
  }

  // Ensure plugin arrays exist for other Vite plugins to manipulate.
  globalMdxOptions.remarkPlugins ??= []
  globalMdxOptions.rehypePlugins ??= []

  const mdxPlugin: MdxPlugin = {
    name: 'vite-plugin-mdx',
    mdxOptions: globalMdxOptions,
    configResolved({ root, plugins }) {
      const reactRefresh = plugins.find((p) => p.name === 'react-refresh')

      this.transform = async function (code, id, ssr) {
        if (/\.mdx?$/.test(id)) {
          const mdxOptions = mergeOptions(globalMdxOptions, getMdxOptions?.(id))
          mdxOptions.filepath = id

          code = await transform(code, mdxOptions, root)
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

  return [
    mdxPlugin,
    // Let .mdx files import other .mdx and .md files without an import
    // specifier to automatically inline their content seamlessly.
    viteMdxTransclusion(globalMdxOptions, getMdxOptions)
  ]
}

function mergeOptions(globalOptions: MdxOptions, localOptions?: MdxOptions) {
  return {
    ...globalOptions,
    ...localOptions,
    remarkPlugins: mergeArrays(
      globalOptions.remarkPlugins,
      localOptions?.remarkPlugins
    ),
    rehypePlugins: mergeArrays(
      globalOptions.rehypePlugins,
      localOptions?.rehypePlugins
    )
  }
}
