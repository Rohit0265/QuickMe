import { SignIn } from '@clerk/clerk-react'
import React from 'react'
 import { dark } from '@clerk/ui/themes'

const Login = () => {
  return (
    <div>
        <SignIn appearance={{
            theme:dark,
        }}/>
    </div>
  )
}

export default Login