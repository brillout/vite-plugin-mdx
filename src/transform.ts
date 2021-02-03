import { startService, Service } from 'esbuild'
import mdx from '@mdx-js/mdx'

/*
//@ts-ignore
import { mdx as mdxReact } from '@mdx-js/react'
console.log('remove-me', mdxReact.length);
*/
// const mdxReact = require.resolve('@mdx-js/react');
const mdxReact = '@mdx-js/react'

const DEFAULT_RENDERER = `
import React from 'react'
import { mdx } from '${mdxReact}'
`

export async function transformMdx({
  code,
  mdxOpts
}: {
  code: string
  mdxOpts?: any
}): Promise<string> {
  const jsx = await mdx(code, mdxOpts)
  const esBuild = await ensureEsbuildService()

  /*
  type TransformOptions = Pick<Parameters<typeof esBuild.transform>, 1>[1];
  let t: TransformOptions;
  t!.format
  t!.jsxFactory
  */

  let { code: codeEsbuild } = await esBuild.transform(jsx, {
    loader: 'jsx',
    jsxFactory: 'mdx',
    target: 'es2019'
  })

  codeEsbuild = codeEsbuild.replace(
    'export default function MDXContent',
    'export default MDXContent; function MDXContent'
  )

  // console.log('codeEsbuild', codeEsbuild);

  const codeTransformed = `${DEFAULT_RENDERER}\n${codeEsbuild}`

  return codeTransformed
}

let _service: Promise<Service> | undefined
async function ensureEsbuildService() {
  if (!_service) {
    _service = startService()
  }
  return _service
}
export async function stopService() {
  if (_service) {
    const service = await _service
    service.stop()
    _service = undefined
  }
}
