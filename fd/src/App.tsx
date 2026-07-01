import React from 'react'
import LoginPage from './pages/LoginPage'
import { useUser, useAuth } from '@clerk/clerk-react'
import { Route, Routes } from 'react-router-dom'

const App = () => {

  return (
    <div>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path="/login" element={<LoginPage/>} />
      </Routes>
      <LoginPage/>
    </div>
  )
}

export default App