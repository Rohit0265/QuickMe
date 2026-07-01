import React from 'react'
import LoginPage from './pages/LoginPage'
import { useUser, useAuth } from '@clerk/clerk-react'

const App = () => {

  return (
    <div>
      <LoginPage/>
    </div>
  )
}

export default App