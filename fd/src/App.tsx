import React from 'react'
import LoginPage from './pages/LoginPage'
import { Route, Routes, Navigate } from 'react-router'
import Home from './pages/Home'
import Upload from './pages/Upload'
import User from './pages/User'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={
          <ProtectedRoute>
            <Home/>
          </ProtectedRoute>
        }/>
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/upload" element={
          <ProtectedRoute>
            <Upload/>
          </ProtectedRoute>
        } />
        <Route path="/user" element={
          <ProtectedRoute>
            <User/>
          </ProtectedRoute>
        } />
        {/* Wildcard to redirect any other URL to / */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer/>
    </div>
  )
}

export default App