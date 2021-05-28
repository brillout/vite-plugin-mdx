import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import Hello from './Hello.md'
import "prismjs/themes/prism-tomorrow.css"

ReactDOM.render(
  <React.StrictMode>
    <Hello />
  </React.StrictMode>,
  document.getElementById('react-root')
)
