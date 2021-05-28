import { Counter } from './Counter.jsx';

# Hello

This text is written in Markdown.

MDX allows Rich React components to be used directly in Markdown: <Counter/>

Edit `Counter.jsx` or `Hello.md` and save to experience HMR updates.

## Plugin Support

### Install `remark-prism`

```bash
yarn add remark-prism
```

### Include CSS

```javascript
import "prismjs/themes/prism-tomorrow.css"
```

### Declare Plugin in `vite.config.js`

```javascript
import reactRefresh from '@vitejs/plugin-react-refresh'
import mdx from 'vite-plugin-mdx'

const options = {
  remarkPlugins: [
    // plugin added!
    require('remark-prism')
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
