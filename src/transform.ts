import { startService, Service } from 'esbuild'
import { join as pathJoin } from 'path';
import mdx from '@mdx-js/mdx'

export async function transformMdx({
  code,
  mdxOpts,
  ssr = false
}: {
  code: string
  mdxOpts?: any
  ssr?: boolean
}): Promise<string> {
  const jsx = await mdx(code, mdxOpts)
  const esBuild = await ensureEsbuildService()

  /* Uncomment to inspect TransformOptions
  type TransformOptions = Pick<Parameters<typeof esBuild.transform>, 1>[1];
  let t: TransformOptions;
  t!.format
  t!.jsxFactory
  //*/

  let { code: codeEsbuild } = await esBuild.transform(jsx, {
    loader: 'jsx',
    jsxFactory: 'mdx',
    target: 'es2019'
  })

  // TODO stabelize this hotfix
  codeEsbuild = codeEsbuild.replace(
    'export default function MDXContent',
    'export default MDXContent; function MDXContent'
  );

  const codeTransformed = [
    `import React from 'react'`,
    `import { mdx } from '${getMdxReactImportPath(ssr)}'`,
    '',
    codeEsbuild
  ].join('\n');

  return codeTransformed
}

function getMdxReactImportPath(ssr: boolean): string {
  if( !ssr ) {
    return '@mdx-js/react';
  } else {
    return resolveEsmEntry('@mdx-js/react');
  }
}

function resolveEsmEntry(moduleName: string): string {
  const packageJson = require(pathJoin(moduleName, 'package.json'));
  const {module: esmPath} = packageJson;
  const esmEntry = require.resolve(pathJoin(moduleName, esmPath));
  return esmEntry;
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
