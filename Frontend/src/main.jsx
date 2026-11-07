import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Portfolio from './Portfolio.jsx'
import Projects from './Projects.jsx'
import Admin from './Admin.jsx'
import './index.css'
import AuthProvider from './Context/AuthProvider.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/admin" element={<Admin />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="*" element={<Portfolio />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)
