import { startService, Service } from 'esbuild'
import mdx from '@mdx-js/mdx'
import findDependency from 'find-dependency'
import { MdxOptions } from './types'

export { transform }
export { stopService }

const pluginName = 'vite-plugin-mdx'

async function transform(
  code_mdx: string,
  mdxOptions?: MdxOptions,
  root = __dirname
) {
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
  if (findPackage('preact', root)) {
    return [
      `import { h } from 'preact'`,
      `import { mdx } from '${getMdxImportPath('@mdx-js/preact', root)}'`,
      '',
      code_es2019
    ].join('\n')
  }

  if (findPackage('react', root)) {
    return [
      `import React from 'react'`,
      `import { mdx } from '${getMdxImportPath('@mdx-js/react', root)}'`,
      '',
      code_es2019
    ].join('\n')
  }

  throw new Error(
    `[Wrong Usage][${pluginName}] You need to \`npm install react\` or \`npm install preact\`.`
  )
}

function getMdxImportPath(mdxPackageName: string, root: string): string {
  const mdxPackageRoot = findPackage(mdxPackageName, root)
  if (mdxPackageRoot) {
    return mdxPackageName
  }
  throw new Error(
    `[Wrong Usage][${pluginName}] You need to \`npm install ${mdxPackageName}\`.`
  )
}

/**
 * Search the node_modules of `cwd` and its ancestors until a package is found.
 * Skip global node_modules and vite/node_modules (local clone might be used).
 */
function findPackage(name: string, cwd: string) {
  return findDependency(name, { cwd, skipGlobal: true })
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
