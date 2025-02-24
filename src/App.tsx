import './App.css'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import Home from './components/Home'


function App() {
  

  return (
    <>
        <header>
        <SignedOut>
        <SignInButton />
      </SignedOut>

      <SignedIn>
      <UserButton />
      <Home/>
      </SignedIn>

      </header>

    </>
  )
}

export default App
