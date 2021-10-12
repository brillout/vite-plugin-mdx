import React from 'react'

export { App }

import HelloContent, { title, description } from './Hello.md'

function App() {

  return (
    <>
      <p>
        Here is some metadata extracted from the MDX file with <code>remark-frontmatter</code>
        and <code>remark-mdx-frontmatter</code>:
      </p>
      <dl>
        <dt>title</dt>
        <dd>{title}</dd>
        <dt>description</dt>
        <dd>{description}</dd>
      </dl>
      <p>And here is the content of the file:</p>
      <div>
        <HelloContent />
      </div>
    </>
  )
}
