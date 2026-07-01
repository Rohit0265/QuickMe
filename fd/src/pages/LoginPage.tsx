import React from 'react'
import Login from '../components/Login'
import Signup from '../components/SignUp'
import { useUser, useAuth } from '@clerk/clerk-react'

const LoginPage = () => {
    const {user} = useUser()
    const {isSignedIn} = useAuth()
    console.log(user);
    console.log("Signed in = " , isSignedIn);


    if(isSignedIn){
        return(
            <div>
                <h1>Welcome {user?.fullName}</h1>
            </div>
        )
    }

  return (
    <div className='flex w-full items-center justify-center'>
            <Login/>
    </div>
  )
}

export default LoginPage