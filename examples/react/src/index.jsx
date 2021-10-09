import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import * as HelloStuff from './Hello.md'
import "prismjs/themes/prism-tomorrow.css"

const Hello = HelloStuff.default;

console.log(HelloStuff);

ReactDOM.render(
  <React.StrictMode>
    <Hello />
  </React.StrictMode>,
  document.getElementById('react-root')
)
