import React from 'react'
import LoginPage from './pages/LoginPage'
import { useUser, useAuth } from '@clerk/clerk-react'
import { Route, Routes } from 'react-router'
import Home from './pages/Home'
import Upload from './pages/Upload'
import Footer from './components/Footer'

const App = () => {

  return (
    <div>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/upload" element={<Upload/>} />
      </Routes>
      <Footer/>
    </div>
  )
}

export default App