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
  const code_jsx = await mdxToJsx(code_mdx, mdxOptions)
  const code_es2019 = await jsxToES2019(code_jsx)
  const code_final = injectImports(code_es2019, ssr)
  return code_final
}

async function mdxToJsx(code_mdx: string, mdxOptions: any) {
  const code_jsx = await mdx(code_mdx, {
    ...mdxOptions,
    skipExport: true,
    mdxFragment: false
  })
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
    jsxFactory: 'h',
    target: 'es2019'
  })

  console.log('bce', code_es2019)
  code_es2019 = code_es2019.split(/\bmdx\b/).join('h')

  // TODO stabelize this bugfix
  code_es2019 = code_es2019.replace(
    'export default function MDXContent',
    'export default MDXContent; function MDXContent'
  )

  return code_es2019
}

function injectImports(code_es2019: string, ssr: boolean) {
  const prefix = `// Vue babel plugin doesn't support pragma replacement
import {mdx} from '@mdx-js/vue'
let h
`

  const suffix = `export default {
  name: 'Mdx',
  inject: {
    $mdxComponents: {
      default: () => () => ({})
    }
  },
  computed: {
    components() {
      return this.$mdxComponents()
    }
  },
  render(createElement) {
    h = mdx.bind({createElement, components: this.components})
    return MDXContent({components: this.components})
  }
}
`
  const code_withImports = [prefix, code_es2019, suffix].join('\n')

  return code_withImports
}
function getMdxReactImportPath(ssr: boolean): string {
  if (!ssr) {
    return '@mdx-js/react'
  } else {
    return resolveEsmEntry('@mdx-js/react')
  }
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
