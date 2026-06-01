import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

function ResponsiveToaster() {
  const [position, setPosition] = useState(
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'bottom-center' : 'top-right'
  )

  useEffect(() => {
    const handleResize = () => {
      setPosition(window.innerWidth < 768 ? 'bottom-center' : 'top-right')
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return <Toaster position={position} toastOptions={{ duration: 3000 }} />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ResponsiveToaster />
    <App />
  </React.StrictMode>
)
