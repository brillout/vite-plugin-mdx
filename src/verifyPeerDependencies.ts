export { verifyPeerDependencies }

function verifyPeerDependencies() {
  let dependencyMissing = false
  try {
    require('@mdx-js/mdx')
  } catch (err) {
    dependencyMissing = true
  }
  try {
    require('@mdx-js/react')
  } catch (err) {
    dependencyMissing = true
  }
  if (dependencyMissing) {
    throw new Error(
      '[vite-plugin-mdx][Wrong Usage] Peer dependency `@mdx-js/mdx` or `@mdx-js/react` missing. Make sure to install and include both `@mdx-js/mdx` and `@mdx-js/react` to your `package.json`. '
    )
  }
}
