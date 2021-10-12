---
title: 'Hello'
description: 'A quick example of how to use remark plugins with vite-plugin-mdx'
---

import { Counter } from './Counter.jsx';

# Hello

This text is written in Markdown.

MDX allows Rich React components to be used directly in Markdown: <Counter/>

Edit `Counter.jsx` or `Hello.md` and save to experience HMR updates.

## Plugin Support

### Install `remark-frontmatter` and `remark-mdx-frontmatter`

```bash
yarn add remark-frontmatter@2^ remark-mdx-frontmatter
```

Note that remark-frontmatter has some breaking changes after version 2; pin to that version.

### Declare Plugin in `vite.config.js`

```javascript
import reactRefresh from '@vitejs/plugin-react-refresh'
import mdx from 'vite-plugin-mdx'

const options = {
  remarkPlugins: [
    // plugin added!
    require('remark-frontmatter'),
    require('remark-mdx-frontmatter').remarkMdxFrontmatter,
  ],
  rehypePlugins: [],
}

export default {
  plugins: [
    reactRefresh(),
    mdx(options),
  ]
}
```

### Import Markdown Files

- md or mdx extensions are acceptable

```javascript
import Hello from './Hello.md'
```

- attributes defined in frontmatter are exposed through other module exports

```javascript
import Hello, { title, description } from './Hello.md'
```
