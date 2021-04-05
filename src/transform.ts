import { startService, Service } from 'esbuild'
import { MdxOptions } from './types'
import { assertImportExists, requireMdx, resolveImport } from './resolveImport'

export { transform }
export { stopService }

async function transform(
  code_mdx: string,
  mdxOptions?: MdxOptions,
  root = __dirname
) {
  const mdx = requireMdx(root)
  const code_jsx = await mdx(code_mdx, mdxOptions as any)
  const code_es2019 = await jsxToES2019(code_jsx)
  const code_final = injectImports(code_es2019, root)
  return code_final
}

async function jsxToES2019(code_jsx: string) {
  // We use `esbuild` ourselves instead of letting Vite doing the esbuild transform,
  // because there don't seem to be a way to change the esbuild options for specific
  // files only: https://vitejs.dev/config/#esbuild

  const esBuild = await ensureEsbuildService()

  /* Uncomment this to inspect the type `TransformOptions`
  type TransformOptions = Pick<Parameters<typeof esBuild.transform>, 1>[1];
  let t: TransformOptions;
  t!.format
  t!.jsxFactory
  //*/

  let { code: code_es2019 } = await esBuild.transform(code_jsx, {
    loader: 'jsx',
    jsxFactory: 'mdx',
    target: 'es2019'
  })

  // TODO stabilize this bugfix
  code_es2019 = code_es2019.replace(
    'export default function MDXContent',
    'export default MDXContent; function MDXContent'
  )

  return code_es2019
}

function injectImports(code_es2019: string, root: string) {
  if (resolveImport('preact', root)) {
    return [
      `import { h } from 'preact'`,
      `import { mdx } from '${assertImportExists('@mdx-js/preact', root)}'`,
      '',
      code_es2019
    ].join('\n')
  }

  if (resolveImport('react', root)) {
    return [
      `import React from 'react'`,
      `import { mdx } from '${assertImportExists('@mdx-js/react', root)}'`,
      '',
      code_es2019
    ].join('\n')
  }

  throw new Error(`[vite-plugin-mdx] "react" or "preact" must be installed`)
}

let _service: Promise<Service> | undefined
async function ensureEsbuildService() {
  if (!_service) {
    _service = startService()
  }
  return _service
}
async function stopService() {
  if (_service) {
    const service = await _service
    service.stop()
    _service = undefined
  }
}
