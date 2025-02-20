import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import DrawingBoard from './DrawingBoard.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DrawingBoard />
  </StrictMode>,
)
