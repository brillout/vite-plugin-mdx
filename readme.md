# Vite Plugin MDX

Vite plugin to use MDX for your Vite app.

Features:

- Works with MDX v1 as well as MDX v2.
- Works with React.
- Works with Vue [**[WIP]**](https://github.com/brillout/vite-plugin-mdx/issues/3).
- HMR support.
- SSR support.
- Frontmatter support (with [remark-frontmatter](https://github.com/remarkjs/remark-frontmatter)).

### Getting Started

1. Install `@brillout/vite-plugin-mdx` as well as MDX.

   ```sh
    npm install @brillout/vite-plugin-mdx
    npm install @mdx-js/mdx
    npm install @mdx-js/react
   ```

2. Add the plugin to your `vite.config.js`.

   ```js
   // vite.config.js

   import mdx from '@brillout/vite-plugin-mdx'

   export default {
     plugins: [mdx()]
   }
   ```

3. You can now write `.mdx` files.

   ```mdx-js
   // hello.mdx

   import { Counter } from './Counter.jsx'

   # Hello

   This text is written in Markdown.

   MDX allows Rich React components to be used directly in Markdown: <Counter/>
   ```

   ```jsx
   // Counter.jsx

   import React, { useState } from 'react'

   export { Counter }

   function Counter() {
     const [count, setCount] = useState(0)

     return (
       <button onClick={() => setCount((count) => count + 1)}>
         Counter: {count}
       </button>
     )
   }
   ```

That's it.

### Example

[/examples/react/](/examples/react/).
