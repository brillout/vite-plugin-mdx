import { startService, Service } from 'esbuild'
import mdx from '@mdx-js/mdx'
import { join as pathJoin } from 'path'
import resolve = require('resolve-from')

export { transform }
export { stopService }

const pluginName = 'vite-plugin-mdx'

async function transform(
  code_mdx: string,
  mdxOptions?: mdx.Options,
  ssr = false,
  root = __dirname
) {
  const code_jsx = await mdx(code_mdx, mdxOptions)
  const code_es2019 = await jsxToES2019(code_jsx)
  const code_final = injectImports(code_es2019, ssr, root)
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

function injectImports(code_es2019: string, ssr: boolean, root: string) {
  if (resolve.silent(root, 'preact')) {
    return [
      `import { h } from 'preact'`,
      `import { mdx } from '${getMdxImportPath('@mdx-js/preact', ssr, root)}'`,
      '',
      code_es2019
    ].join('\n')
  }

  if (resolve.silent(root, 'react')) {
    return [
      `import React from 'react'`,
      `import { mdx } from '${getMdxImportPath('@mdx-js/react', ssr, root)}'`,
      '',
      code_es2019
    ].join('\n')
  }

  throw new Error(
    `[Wrong Usage][${pluginName}] You need to \`npm install react\` or \`npm install preact\`.`
  )
}

function getMdxImportPath(
  mdxPackageName: string,
  ssr: boolean,
  root: string
): string {
  const packageJsonPath = resolve.silent(
    root,
    pathJoin(mdxPackageName, 'package.json')
  )
  if (packageJsonPath) {
    return ssr
      ? pathJoin(mdxPackageName, require(packageJsonPath).module)
      : mdxPackageName
  }
  throw new Error(
    `[Wrong Usage][${pluginName}] You need to \`npm install ${mdxPackageName}\`.`
  )
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
