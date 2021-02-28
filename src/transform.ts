import { startService, Service } from 'esbuild'
//@ts-ignore
import mdx from '@mdx-js/mdx'
import { join as pathJoin } from 'path'

export { transform }
export { stopService }

async function transform({
  code_mdx,
  mdxOptions,
  ssr = false
}: {
  code_mdx: string
  mdxOptions?: any
  ssr?: boolean
}): Promise<string> {
  const preactInstalled = isPreactInstalled()
  const reactInstalled = isReactInstalled()
  let code_final = ''
  if (!preactInstalled && !reactInstalled) {
    const errorMessage = `Neither Preact Or React are installed. 
    You must have one of these libraries installed to use this plugin.`
    console.error(errorMessage)
  } else {
    const code_jsx = await mdxToJsx(code_mdx, mdxOptions)
    const code_es2019 = await jsxToES2019(code_jsx)
    code_final = injectImports(
      code_es2019,
      ssr,
      preactInstalled,
      reactInstalled
    )
  }
  return code_final
}

function isPreactInstalled(): boolean {
  let preactInstalled
  try {
    require('preact')
    preactInstalled = true
  } catch (err) {
    preactInstalled = false
  }
  return preactInstalled
}
function isReactInstalled(): boolean {
  let reactInstalled
  try {
    require('react')
    reactInstalled = true
  } catch (err) {
    reactInstalled = false
  }
  return reactInstalled
}

async function mdxToJsx(code_mdx: string, mdxOptions: any) {
  const code_jsx = await mdx(code_mdx, mdxOptions)
  return code_jsx
}

async function jsxToES2019(code_jsx: string) {
  // We use esbuild ourselves instead of letting Vite doing the esbuild transform,
  // because there don't seem to be a way to change the esbuild options for specific
  // files only: https://vitejs.dev/config/#esbuild

  const esBuild = await ensureEsbuildService()

  /* Uncomment to inspect TransformOptions
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

  // TODO stabelize this bugfix
  code_es2019 = code_es2019.replace(
    'export default function MDXContent',
    'export default MDXContent; function MDXContent'
  )

  return code_es2019
}

function injectImports(
  code_es2019: string,
  ssr: boolean,
  preactInstalled: boolean,
  reactInstalled: boolean
) {
  let code_withImports = ''
  if (preactInstalled) {
    code_withImports = [
      `import {h} from 'preact'`,
      `import { mdx } from '${getMdxImportPath(ssr, 'preact')}'`,
      '',
      code_es2019
    ].join('\n')
  } else if (reactInstalled) {
    code_withImports = [
      `import React from 'react'`,
      `import { mdx } from '${getMdxImportPath(ssr, 'react')}'`,
      '',
      code_es2019
    ].join('\n')
  }

  return code_withImports
}
function getMdxImportPath(ssr: boolean, typeOfJSX: string): string {
  let importToReturn = ''
  switch (typeOfJSX) {
    case 'react':
      if (!ssr) {
        importToReturn = '@mdx-js/react'
      } else {
        importToReturn = resolveEsmEntry('@mdx-js/react')
      }
    case 'preact':
      if (!ssr) {
        importToReturn = '@mdx-js/preact'
      } else {
        importToReturn = resolveEsmEntry('@mdx-js/preact')
      }
  }
  return importToReturn
}

function resolveEsmEntry(moduleName: string): string {
  const packageJson = require(pathJoin(moduleName, 'package.json'))
  const { module: esmPath } = packageJson
  const esmEntry = require.resolve(pathJoin(moduleName, esmPath))
  return esmEntry
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
