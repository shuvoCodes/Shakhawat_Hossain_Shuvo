import React from 'react'
import ReactDOM from 'react-dom/client'
import Portfolio from './Portfolio.jsx'
import './index.css'
import AuthProvider from './Context/AuthProvider.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <Portfolio />
    </AuthProvider>
  </React.StrictMode>,
)
