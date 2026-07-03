import { SignIn } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'

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