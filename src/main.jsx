import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContent.jsx'
import { DarkModeProvider } from './contexts/DarkModeContext.jsx'
import { testConnection } from './services/api.js'
import './index.css'

// Test backend connection on startup
testConnection()
  .then(data => {
    console.log('✅ Backend connection successful:', data.message);
  })
  .catch(error => {
    console.error('❌ Backend connection failed:', error.message);
  });

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <DarkModeProvider>
        <AuthProvider>
          <App />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </AuthProvider>
      </DarkModeProvider>
    </BrowserRouter>

)