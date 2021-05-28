import { render } from 'preact'
import './index.css'
import Hello from './Hello.md'
import "prismjs/themes/prism-tomorrow.css"

render(<Hello />, document.getElementById('preact-root'))
