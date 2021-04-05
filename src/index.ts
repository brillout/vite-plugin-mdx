import { requireMdx } from './resolveImport'
import { remarkMdxImport } from './remarkMdxImport'
import { stopService, transform } from './transform'
import { MdxOptions, MdxPlugin, RemarkPlugin } from './types'
import fs from 'fs'

export { MdxOptions, MdxPlugin }

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

  let mdxImportPlugin: RemarkPlugin
  return {
    name: 'vite-plugin-mdx',
    mdxOptions: globalMdxOptions,
    configResolved({ root, plugins, logger }) {
      const reactRefresh = plugins.find((p) => p.name === 'react-refresh')

      this.transform = async function (code, id, ssr) {
        if (/\.mdx?$/.test(id)) {
          const mdxOptions = mergeOptions(globalMdxOptions, getMdxOptions?.(id))
          mdxOptions.filepath = id

          // When a .mdx or .md file is imported without a specifier,
          // assume the intention is to embed its contents in the importer.
          // (eg: import "./foo.mdx" OR import "./foo.md")
          mdxOptions.remarkPlugins.push(
            (mdxImportPlugin ??= remarkMdxImport({
              readFile: (filePath) => fs.promises.readFile(filePath, 'utf8'),
              resolve: async (id, importer) => {
                const resolved = await this.resolve(id, importer)
                if (!resolved)
                  logger.warn(
                    `Failed to resolve "${id}" imported by "${importer}"`
                  )

                return resolved?.id
              },
              getCompiler(filePath) {
                const remarkPlugins = mergeArrays(
                  globalMdxOptions.remarkPlugins,
                  getMdxOptions?.(filePath).remarkPlugins
                )
                remarkPlugins.push(mdxImportPlugin)
                return requireMdx(root).createMdxAstCompiler({
                  remarkPlugins: remarkPlugins as any[]
                })
              }
            }))
          )

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

function mergeArrays<T>(a: T[] = [], b: T[] = []) {
  return a.concat(b).filter(Boolean)
}
