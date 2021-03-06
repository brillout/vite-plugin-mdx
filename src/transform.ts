import { startService, Service } from 'esbuild'
//@ts-ignore
import mdx from '@mdx-js/mdx'
import { join as pathJoin } from 'path'

export { transform }
export { stopService }

const pluginName = 'vite-plugin-mdx'

async function transform({
  code_mdx,
  mdxOptions,
  ssr = false
}: {
  code_mdx: string
  mdxOptions?: any
  ssr?: boolean
}): Promise<string> {
  const code_jsx = await mdxToJsx(code_mdx, mdxOptions)
  const code_es2019 = await jsxToES2019(code_jsx)
  const code_final = injectImports(code_es2019, ssr)
  return code_final
}

async function mdxToJsx(code_mdx: string, mdxOptions: any) {
  const code_jsx = await mdx(code_mdx, mdxOptions)
  return code_jsx
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

function injectImports(code_es2019: string, ssr: boolean) {
  if (isInstalled('preact')) {
    return [
      `import { h } from 'preact'`,
      `import { mdx } from '${getMdxImportPath('@mdx-js/preact', ssr)}'`,
      '',
      code_es2019
    ].join('\n')
  }

  if (isInstalled('react')) {
    return [
      `import React from 'react'`,
      `import { mdx } from '${getMdxImportPath('@mdx-js/react', ssr)}'`,
      '',
      code_es2019
    ].join('\n')
  }

  throw new Error(
    `[Wrong Usage][${pluginName}] You need to \`npm install react\` or \`npm install preact\`.`
  )
}
function getMdxImportPath(mdxPackageName: string, ssr: boolean): string {
  if (!isInstalled(mdxPackageName)) {
    throw new Error(
      `[Wrong Usage][${pluginName}] You need to \`npm install ${mdxPackageName}\`.`
    )
  }
  if (!ssr) {
    return mdxPackageName
  } else {
    return resolveEsmEntry(mdxPackageName)
  }
}

function resolveEsmEntry(moduleName: string): string {
  const packageJson = require(pathJoin(moduleName, 'package.json'))
  const { module: esmPath } = packageJson
  const esmEntry = require.resolve(pathJoin(moduleName, esmPath))
  return esmEntry
}

function isInstalled(packageName: string): boolean {
  let yes
  try {
    require(packageName)
    yes = true
  } catch (err) {
    yes = false
  }
  return yes
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
