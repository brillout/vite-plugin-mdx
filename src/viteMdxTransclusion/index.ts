import type { Plugin } from 'vite'
import LRUCache from '@alloc/quick-lru'
import fs from 'fs'

import { MdxPlugin, MdxOptions } from '../types'
import { mergeArrays } from '../common'
import { MdxAstCache, remarkTransclusion } from './remarkTransclusion'
import { createMdxAstCompiler } from './createMdxAstCompiler'
import { ImportMap } from './ImportMap'

/**
 * With transclusion enabled, an `.mdx` file can import other `.mdx` or `.md`
 * files without an import specifier.
 *
 *     import "../other.mdx"
 *
 * The file extension is required.
 *
 * The imported file is inlined into its importer, but the imported file can
 * still have its own Remark plugins.
 *
 */
export function viteMdxTransclusion(
  globalMdxOptions: MdxPlugin['mdxOptions'],
  getMdxOptions?: (filename: string) => MdxOptions
): Plugin {
  /**
   * To recompile an importer when its transcluded files are changed,
   * we need to track the relationships between them.
   */
  let importMap: ImportMap
  /**
   * To avoid redundant parsing and processing, we cache the MDX syntax trees
   * of transcluded files to serve as a fast path when an importer is recompiled.
   */
  let astCache: MdxAstCache

  return {
    name: 'mdx:transclusion',
    configureServer({ watcher }) {
      importMap = new ImportMap()
      astCache = new LRUCache({
        maxAge: 30 * 6e4, // 30 minutes
        maxSize: 100
      })

      // When a transcluded file changes, recompile its importers.
      // Also, clean up the import map when an importer is deleted.
      watcher.on('all', (event, filePath) => {
        if (/\.mdx?$/.test(filePath)) {
          if (event === 'unlink') {
            importMap.deleteImporter(filePath)
          }
          const importers = importMap.importers.get(filePath)
          if (importers) {
            astCache.delete(filePath)
            importers.forEach((importer) => {
              watcher.emit('change', importer)
            })
          }
        }
      })
    },
    configResolved({ root, logger }) {
      // The remark plugin needs to resolve imports manually.
      let resolve: (id: string, importer?: string) => Promise<any>
      this.buildStart = function () {
        resolve = this.resolve
      }

      globalMdxOptions.remarkPlugins.push(
        remarkTransclusion({
          astCache,
          importMap,
          async resolve(id, importer) {
            const resolved = await resolve(id, importer)
            if (!resolved)
              logger.warn(`Failed to resolve "${id}" imported by "${importer}"`)

            return resolved?.id
          },
          readFile: (filePath) => fs.promises.readFile(filePath, 'utf8'),
          getCompiler: (filePath) =>
            createMdxAstCompiler(
              root,
              mergeArrays(
                globalMdxOptions.remarkPlugins,
                getMdxOptions?.(filePath).remarkPlugins
              )
            )
        })
      )
    }
  }
}
