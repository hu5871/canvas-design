import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'tdesign-react/dist/tdesign.css';
import App from './App.js'

import './index.css'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
